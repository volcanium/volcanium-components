import { useEffect, useLayoutEffect, useMemo, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Squircle } from "@squircle-js/react";
import clsx from "clsx";
import {
  IconFilter,
  IconTrash,
  IconRefresh,
  IconPlus,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconChevronUp,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconSelector,
  IconExternalLink,
} from "@tabler/icons-react";
import Title from "./Title";
import Input from "./Input";
import Loader from "./Loader";
import TooltipButton from "./TooltipButton";
import TableCell, { TableColumnDef } from "./TableCell";
import TableNewRowModal, { NewRowConfig } from "./TableNewRowModal";
import TableDeleteRowModal from "./TableDeleteRowModal";
import { notify } from "./notify";
import { useLanguage } from "../../utils/useLanguage";
import { useClickOutside } from "../../utils/useDropdown";

export type { TableColumnDef, TableCellType, TableCellValueParams } from "./TableCell";

interface TableFetchResult<Row> {
  data: Row[];
  total?: number;
}

export interface TableSort {
  field: string;
  dir: 1 | -1;
}

/**
 * Passed to `fetchMethod` only when `serverSide` is set - a plain
 * client-side table (the default) always calls `fetchMethod()` with no
 * argument, exactly like before.
 */
export interface TableFetchParams {
  search: string;
  page: number;
  pageSize: number;
  sort: TableSort | null;
  filters: Record<string, any>;
}

export interface CellValueChangedEvent<Row> {
  data: Row;
  colDef: { field: string };
  oldValue: any;
  newValue: any;
  value: any;
}

interface EditAction {
  rowKey: any;
  field: string;
  oldValue: any;
  newValue: any;
}

export interface TableProps<Row extends Record<string, any>> {
  title: string;
  colsDefs: TableColumnDef<Row>[];
  /** Champ unique identifiant chaque ligne. Par defaut "id". */
  rowKey?: string;
  /**
   * @deprecated Le tableau gere lui-meme son etat de chargement autour de
   * `fetchMethod` (spinner tant que la promesse n'est pas resolue). Ce prop
   * n'a plus d'effet - le retirer des appelants existants.
   */
  loading?: boolean;
  /** Recharge les donnees quand cette valeur change. */
  reloadKey?: string | number;
  /**
   * En mode client (par defaut), appele sans argument : doit retourner
   * l'integralite des lignes, recherche/filtres/tri/pagination sont geres
   * ici meme, cote client. En mode `serverSide`, recoit `TableFetchParams`
   * et doit retourner `{ data, total }` - `data` = uniquement la page
   * courante deja filtree/triee par le serveur, `total` = nombre total de
   * lignes toutes pages confondues (pour la pagination et le "X-Y sur Z").
   */
  fetchMethod: (params?: TableFetchParams) => Promise<Row[] | TableFetchResult<Row>>;
  /** Active la colonne de cases a cocher + les actions de selection. Desactive par defaut. */
  selectable?: boolean;
  onSelect?: (selectedRows: Row[]) => void;
  deleteRow?: boolean;
  deleteRequest?: (selectedRows: Row[]) => Promise<void>;
  openRequest?: (selectedRows: Row[]) => void;
  /** Clic sur une ligne (hors boutons, liens et champs qu'elle contient) : ouvre par exemple la page de détail. */
  onRowClick?: (row: Row) => void;
  modifMethod?: (params: CellValueChangedEvent<Row>) => void;
  newRow?: NewRowConfig;
  searchPlaceholder?: string;
  className?: string;
  /**
   * Passe la recherche, les filtres, le tri et la pagination a `fetchMethod`
   * au lieu de les appliquer cote client sur un tableau deja charge en
   * entier - pour les gros volumes de donnees ou charger toutes les lignes
   * d'un coup n'est pas raisonnable. Desactive par defaut (comportement
   * inchange).
   */
  serverSide?: boolean;
  /** Nombre de lignes par page en mode `serverSide`. Par defaut 25. */
  pageSize?: number;
}

function getDisplayText<Row>(col: TableColumnDef<Row>, row: Row): string {
  const value = (row as any)[col.field];
  if (col.valueFormatter) return col.valueFormatter({ value, data: row });
  if (col.type === "select" && col.options) {
    return String(col.options.find((o) => o.value === value)?.label ?? value ?? "");
  }
  if (col.type === "checkbox" || typeof value === "boolean") return value ? "true" : "false";
  return value === null || value === undefined ? "" : String(value);
}

export default function Table<Row extends Record<string, any>>({
  title,
  colsDefs,
  rowKey = "id",
  reloadKey,
  fetchMethod,
  selectable = false,
  onSelect,
  deleteRow,
  deleteRequest,
  openRequest,
  modifMethod,
  newRow,
  searchPlaceholder,
  className,
  serverSide = false,
  pageSize = 25,
  onRowClick,
}: TableProps<Row>) {
  const { t } = useLanguage();
  const [data, setData] = useState<Row[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [reloadSpinning, setReloadSpinning] = useState(true);
  const [search, setSearch] = useState("");
  // Chaque valeur est un tableau (case a cocher multiple, combinees en OU) -
  // meme principe que le systeme de filtres colonne de Train Company
  // (front/src/components/ui/Table.tsx), replique ici plutot qu'une seule
  // valeur par colonne comme avant.
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState<TableSort | null>(null);
  const [page, setPage] = useState(0);
  // En mode serverSide, la recherche/les filtres ne partent au serveur
  // qu'apres un court debounce - sans quoi chaque frappe declencherait sa
  // propre requete. `page` est reinitialise en meme temps (meme lot de
  // mise a jour d'etat) pour ne provoquer qu'un seul rechargement, pas deux.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, string[]>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<any>>(new Set());
  const [editingCell, setEditingCell] = useState<{ rowKey: any; field: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [past, setPast] = useState<EditAction[]>([]);
  const [future, setFuture] = useState<EditAction[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);

  // `table-layout: auto` (the browser default, used below until this locks
  // in) recomputes every column's width from whatever rows are actually
  // visible - so filtering/searching down to a narrower or wider set of
  // values visibly resized every column on each keystroke. Measured once,
  // right after the first real rows render, as a percentage of the header
  // row's own width (not raw px) so it still adapts to the table's
  // container being resized later, just not to which rows happen to be
  // showing.
  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const [lockedWidths, setLockedWidths] = useState<string[] | null>(null);
  useLayoutEffect(() => {
    if (lockedWidths || loadingData || data.length === 0) return;
    const row = headerRowRef.current;
    if (!row) return;
    const cells = Array.from(row.children) as HTMLElement[];
    // The checkbox column keeps its own fixed pixel width instead of a
    // share of the percentage split below - a `%` share of a table that's
    // later rendered much narrower (e.g. a smaller viewport than whatever
    // width it happened to be measured at) could shrink it well under the
    // checkbox's own fixed 18px box, squashing it into a flattened oval
    // instead of clipping/wrapping like text would.
    const isCheckboxCol = (i: number) => selectable && i === 0;
    const total = cells.reduce(
      (sum, el, i) => (isCheckboxCol(i) ? sum : sum + el.getBoundingClientRect().width),
      0,
    );
    if (total === 0) return;
    setLockedWidths(
      cells.map((el, i) => {
        const w = el.getBoundingClientRect().width;
        return isCheckboxCol(i) ? `${w}px` : `${(w / total) * 100}%`;
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingData, data.length, lockedWidths]);
  // Re-measures from scratch only if the actual shape of the table changes
  // (a different set of columns, or the selectable checkbox column
  // appearing/disappearing) - never on a plain data reload, which is
  // exactly what should stay locked.
  useEffect(() => {
    setLockedWidths(null);
  }, [colsDefs.length, selectable]);

  const loading = loadingData;
  const getRowKey = (row: Row) => (row as any)[rowKey];

  const loadData = async () => {
    setLoadingData(true);
    setReloadSpinning(false);
    setTimeout(() => setReloadSpinning(true), 50);
    try {
      const params: TableFetchParams | undefined = serverSide
        ? { search: debouncedSearch, page, pageSize, sort, filters: debouncedFilters }
        : undefined;
      const res = await fetchMethod(params);
      const rows = Array.isArray(res) ? res : res.data;
      setData(rows);
      if (serverSide) setTotal(Array.isArray(res) ? rows.length : (res.total ?? rows.length));
      setPast([]);
      setFuture([]);
      setSelectedKeys(new Set());
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t("table_unexpected_error"));
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  // Reagit aux changements de page/tri/recherche/filtres - uniquement en
  // mode serverSide (en mode client, ces memes changements sont geres plus
  // bas par `visibleRows`, sans nouvel appel a `fetchMethod`). Le premier
  // rendu est ignore : l'effet ci-dessus (sur `reloadKey`) a deja fait le
  // chargement initial, un second ici ferait doublon.
  const skippedFirstServerLoad = useRef(false);
  useEffect(() => {
    if (!serverSide) return;
    if (!skippedFirstServerLoad.current) {
      skippedFirstServerLoad.current = true;
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSide, page, sort, debouncedSearch, debouncedFilters]);

  useEffect(() => {
    if (!serverSide) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedFilters(filters);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters, serverSide]);

  // --- Edition + historique annulable (Ctrl+Z / Ctrl+Shift+Z) ---

  const applyLocal = (targetKey: any, field: string, value: any) => {
    setData((prev) =>
      prev.map((r) => (getRowKey(r) === targetKey ? { ...r, [field]: value } : r)),
    );
  };

  const notifyChange = (row: Row, field: string, oldValue: any, newValue: any) => {
    try {
      modifMethod?.({
        data: { ...row, [field]: newValue },
        colDef: { field },
        oldValue,
        newValue,
        value: newValue,
      });
    } catch (err) {
      notify.error(err instanceof Error ? err.message : t("table_unexpected_error"));
    }
  };

  const commitEdit = (row: Row, field: string, newValue: any) => {
    const key = getRowKey(row);
    const oldValue = (row as any)[field];
    setEditingCell(null);
    if (oldValue === newValue) return;
    applyLocal(key, field, newValue);
    setPast((p) => [...p, { rowKey: key, field, oldValue, newValue }]);
    setFuture([]);
    notifyChange(row, field, oldValue, newValue);
  };

  const undo = () => {
    setPast((p) => {
      if (p.length === 0) return p;
      const action = p[p.length - 1];
      const row = data.find((r) => getRowKey(r) === action.rowKey);
      applyLocal(action.rowKey, action.field, action.oldValue);
      setFuture((f) => [...f, action]);
      if (row) notifyChange(row, action.field, action.newValue, action.oldValue);
      return p.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const action = f[f.length - 1];
      const row = data.find((r) => getRowKey(r) === action.rowKey);
      applyLocal(action.rowKey, action.field, action.newValue);
      setPast((p) => [...p, action]);
      if (row) notifyChange(row, action.field, action.oldValue, action.newValue);
      return f.slice(0, -1);
    });
  };

  // Un ref "relais" pour que le listener clavier (monte une seule fois) lise
  // toujours les dernieres versions de undo/redo sans se re-abonner a chaque render.
  const actionsRef = useRef({ undo, redo });
  actionsRef.current = { undo, redo };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || e.key.toLowerCase() !== "z") return;
      const active = document.activeElement;
      const withinTable = containerRef.current?.contains(active);
      const typingElsewhere =
        active &&
        active !== document.body &&
        !withinTable &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || (active as HTMLElement).isContentEditable);
      if (typingElsewhere) return;
      if (!withinTable && !hoveringRef.current) return;
      e.preventDefault();
      if (e.shiftKey) actionsRef.current.redo();
      else actionsRef.current.undo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Le bouton/la modale de suppression apparaissent des qu'un `deleteRequest`
  // est fourni ; `deleteRow={false}` reste le seul moyen de les desactiver
  // explicitement malgre un `deleteRequest` present.
  const showDelete = !!deleteRequest && deleteRow !== false;

  // --- Filtrage + recherche + tri ---

  // Une colonne dont au moins une ligne chargee porte un booleen est traitee
  // comme une colonne "checkbox" pour le filtre (menu Oui/Non), meme sans
  // `type: "checkbox"` explicite.
  const booleanFields = useMemo(() => {
    const fields = new Set<string>();
    for (const col of colsDefs) {
      if (col.type) continue;
      if (data.some((r) => typeof (r as any)[col.field] === "boolean")) fields.add(col.field);
    }
    return fields;
  }, [data, colsDefs]);

  const isCheckboxLike = (col: TableColumnDef<Row>) =>
    col.type === "checkbox" || booleanFields.has(col.field);

  const visibleRows = useMemo(() => {
    // Deja recherchees/filtrees/triees/paginees par `fetchMethod` cote
    // serveur - `data` EST la page a afficher, un second passage cote
    // client la re-filtrerait sur elle-meme (perte de lignes) au lieu de
    // sur l'ensemble reel.
    if (serverSide) return data;

    let rows = data;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((row) =>
        colsDefs.some((c) => c.type !== "img" && getDisplayText(c, row).toLowerCase().includes(q)),
      );
    }

    for (const [field, values] of Object.entries(filters)) {
      if (!values || values.length === 0) continue;
      rows = rows.filter((row) => values.includes(String((row as any)[field])));
    }

    if (sort) {
      const col = colsDefs.find((c) => c.field === sort.field);
      if (col) {
        rows = [...rows].sort((a, b) => {
          const av = getDisplayText(col, a);
          const bv = getDisplayText(col, b);
          const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: "base" });
          return cmp * sort.dir;
        });
      }
    }

    return rows;
  }, [data, search, filters, sort, colsDefs, serverSide]);

  // --- Selection ---

  const selectedRows = useMemo(
    () => data.filter((r) => selectedKeys.has(getRowKey(r))),
    [data, selectedKeys],
  );

  useEffect(() => {
    onSelect?.(selectedRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeys]);

  const toggleRow = (row: Row) => {
    const key = getRowKey(row);
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((r) => selectedKeys.has(getRowKey(r)));

  const toggleAll = () => {
    setSelectedKeys((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        visibleRows.forEach((r) => next.delete(getRowKey(r)));
        return next;
      }
      const next = new Set(prev);
      visibleRows.forEach((r) => next.add(getRowKey(r)));
      return next;
    });
  };

  const toggleSort = (field: string) => {
    setSort((prev) => {
      if (!prev || prev.field !== field) return { field, dir: 1 };
      if (prev.dir === 1) return { field, dir: -1 };
      return null;
    });
    if (serverSide) setPage(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
      className={clsx("flex flex-col gap-2 w-full", className)}
    >
      <Squircle cornerRadius={20} cornerSmoothing={1} asChild>
        <div className="flex flex-col gap-4 p-5 text-left bg-vc-container border border-vc-line w-full">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Title>{title}</Title>
            <div className="flex items-center gap-1.5">
              {selectable && selectedRows.length > 0 && (
                <>
                  <span className="text-sm text-vc-secondary/70 mr-1">
                    {selectedRows.length === 1
                      ? t("table_selected_one", { count: selectedRows.length })
                      : t("table_selected_many", { count: selectedRows.length })}
                  </span>
                  {openRequest && selectedRows.length === 1 && (
                    <TableIconButton tooltip={t("table_open")} onClick={() => openRequest(selectedRows)}>
                      <IconExternalLink size={16} />
                    </TableIconButton>
                  )}
                  {showDelete && (
                    <TableIconButton tooltip={t("table_delete_selection")} onClick={() => setShowDeleteModal(true)}>
                      <IconTrash size={16} />
                    </TableIconButton>
                  )}
                  <div className="h-5 w-px bg-vc-line mx-1" />
                </>
              )}
              <TableIconButton
                tooltip={t("table_undo")}
                disabled={past.length === 0}
                onClick={undo}
              >
                <IconArrowBackUp size={16} />
              </TableIconButton>
              <TableIconButton
                tooltip={t("table_redo")}
                disabled={future.length === 0}
                onClick={redo}
              >
                <IconArrowForwardUp size={16} />
              </TableIconButton>
              <TableIconButton
                tooltip={t("table_reload")}
                className={reloadSpinning ? "duration-500" : "-rotate-180 duration-0"}
                onClick={loadData}
              >
                <IconRefresh size={16} />
              </TableIconButton>
              {newRow && (
                <TableIconButton tooltip={newRow.button?.name || t("table_add")} onClick={() => setShowAddModal(true)}>
                  <IconPlus size={16} />
                </TableIconButton>
              )}
            </div>
          </div>

          <Input
            variant="secondary"
            className="w-full! py-1.5!"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          >
            {searchPlaceholder || t("table_search_placeholder")}
          </Input>

          <div className="relative w-full overflow-x-auto">
            {/* Overlay, not a swap of the tbody's own content: a reload
                triggered by sort/filter/page/search (or Ctrl+Z) used to
                unmount every row the instant `loading` flipped true and
                remount them once the response landed - a jarring
                flash-to-empty-then-back even on a fast network. The
                already-rendered rows now stay exactly where they are
                underneath a dimmed spinner until the new data actually
                replaces them. Only the very first load (no rows yet at all)
                still shows the plain centered loader row further down. */}
            {loading && data.length > 0 && (
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-10 bg-vc-container/60 backdrop-blur-[1px]">
                <Loader />
              </div>
            )}
            <table
              className="w-full border-collapse text-sm"
              style={lockedWidths ? { tableLayout: "fixed" } : undefined}
            >
              {lockedWidths && (
                <colgroup>
                  {lockedWidths.map((w, i) => (
                    <col key={i} style={{ width: w }} />
                  ))}
                </colgroup>
              )}
              <thead>
                <tr ref={headerRowRef} className="border-b border-vc-line">
                  {selectable && (
                    <th className="w-10 py-2 pl-2 pr-2">
                      <Checkbox checked={allVisibleSelected} onChange={toggleAll} />
                    </th>
                  )}
                  {colsDefs.map((col) => {
                    // Suit le systeme de filtres de Train Company
                    // (front/src/components/ui/Table.tsx) : uniquement les
                    // colonnes a valeurs discretes (select / case a cocher)
                    // recoivent une icone de filtre - une colonne texte libre
                    // reste couverte par la recherche globale au-dessus.
                    const isFilterable =
                      col.filterable !== false &&
                      (col.type === "select" ? !!col.options?.length : isCheckboxLike(col));
                    const filterOptions = isFilterable
                      ? col.type === "select"
                        ? col.options!
                        : [
                            { label: t("table_filter_yes"), value: "true" },
                            { label: t("table_filter_no"), value: "false" },
                          ]
                      : [];
                    return (
                      <th
                        key={col.field}
                        className={clsx(
                          "group/header relative py-2 px-2 text-left font-medium text-vc-secondary/70 select-none whitespace-nowrap overflow-hidden",
                          col.sortable !== false && "cursor-pointer hover:text-vc-secondary",
                        )}
                        onClick={() => col.sortable !== false && toggleSort(col.field)}
                      >
                        <span className="inline-flex items-center gap-1 max-w-full min-w-0">
                          <span className="truncate min-w-0">{col.headerName}</span>
                          <span className="inline-flex items-center gap-1 shrink-0">
                            {col.sortable !== false &&
                              (sort?.field === col.field ? (
                                sort.dir === 1 ? (
                                  <IconChevronUp size={13} />
                                ) : (
                                  <IconChevronDown size={13} />
                                )
                              ) : (
                                <IconSelector size={13} className="opacity-30" />
                              ))}
                            {isFilterable && (
                              <ColumnFilterButton
                                label={col.headerName}
                                options={filterOptions}
                                selected={filters[col.field] ?? []}
                                onChange={(values) => setFilters((f) => ({ ...f, [col.field]: values }))}
                                t={t}
                              />
                            )}
                          </span>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* First load only (nothing to show underneath yet) - a
                    reload once rows already exist uses the overlay above
                    instead, see its comment. */}
                {loading && data.length === 0 && (
                  <tr>
                    <td colSpan={colsDefs.length + (selectable ? 1 : 0)} className="py-10">
                      <div className="flex justify-center">
                        <Loader />
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && visibleRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={colsDefs.length + (selectable ? 1 : 0)}
                      className="py-10 text-center text-vc-secondary/50"
                    >
                      {t("table_no_results")}
                    </td>
                  </tr>
                )}
                {visibleRows.length > 0 &&
                  visibleRows.map((row) => {
                    const key = getRowKey(row);
                    return (
                      <tr
                        key={key}
                        onDoubleClick={() => openRequest?.([row])}
                        onClick={
                          onRowClick
                            ? (e) => {
                                if (!(e.target as HTMLElement).closest("button, a, input, select, textarea, label, [role=button]")) onRowClick(row);
                              }
                            : undefined
                        }
                        className={clsx(
                          "border-b border-vc-line/60 last:border-b-0 transition-colors",
                          onRowClick && "cursor-pointer",
                          selectedKeys.has(key) ? "bg-vc-main/10" : "hover:bg-vc-veil",
                        )}
                      >
                        {selectable && (
                          <td className="py-1.5 pl-2 pr-2 align-middle">
                            <div className="h-9 flex items-center">
                              <Checkbox checked={selectedKeys.has(key)} onChange={() => toggleRow(row)} />
                            </div>
                          </td>
                        )}
                        {colsDefs.map((col) => (
                          <td key={col.field} className="py-1.5 px-2 align-middle max-w-70">
                            <TableCell
                              column={col}
                              value={(row as any)[col.field]}
                              row={row}
                              editing={editingCell?.rowKey === key && editingCell?.field === col.field}
                              onStartEdit={() => setEditingCell({ rowKey: key, field: col.field })}
                              onCommit={(v) => commitEdit(row, col.field, v)}
                              onCancel={() => setEditingCell(null)}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {serverSide && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-vc-secondary/60">
                {total === 0
                  ? t("table_no_results")
                  : t("table_results", {
                      count: total ?? visibleRows.length,
                      plural: total === 1 ? "" : "s",
                      page: page + 1,
                      totalPages: total !== null ? Math.max(1, Math.ceil(total / pageSize)) : "…",
                    })}
              </span>
              <div className="flex items-center gap-1.5">
                <TableIconButton
                  tooltip={t("table_previous_page")}
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <IconChevronLeft size={16} />
                </TableIconButton>
                <TableIconButton
                  tooltip={t("table_next_page")}
                  disabled={total !== null ? (page + 1) * pageSize >= total : visibleRows.length < pageSize}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <IconChevronRight size={16} />
                </TableIconButton>
              </div>
            </div>
          )}
        </div>
      </Squircle>

      {newRow && (
        <TableNewRowModal
          newRow={newRow}
          showModal={showAddModal}
          setShowModal={setShowAddModal}
          reloadTable={loadData}
        />
      )}
      {showDelete && (
        <TableDeleteRowModal
          modalDelete={showDeleteModal}
          setModalDelete={setShowDeleteModal}
          reloadTable={loadData}
          selectedRows={selectedRows}
          deleteRequest={deleteRequest}
        />
      )}
    </div>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={clsx(
        "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors cursor-pointer",
        checked ? "bg-vc-main border-vc-main" : "bg-vc-container border-vc-secondary/30 hover:border-vc-main/50",
      )}
    >
      {checked && (
        <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none">
          <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

/**
 * Per-column filter icon + checkbox popover, styled after Train Company's
 * own table filters (front/src/components/ui/Table.tsx): hidden until the
 * header is hovered (or the filter is active), a click opens a portaled
 * checkbox list (several options at once, combined as OR) with a reset
 * action at the bottom.
 */
function ColumnFilterButton({
  label,
  options,
  selected,
  onChange,
  t,
}: {
  label: ReactNode;
  options: { label: ReactNode; value: any }[];
  selected: string[];
  onChange: (values: string[]) => void;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const active = selected.length > 0;

  useClickOutside(triggerRef, panelRef, () => setOpen(false));

  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ left: rect.left, top: rect.bottom + 6 });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const toggleValue = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title={`${t("table_filter")} : ${typeof label === "string" ? label : ""}`}
        className={clsx(
          "inline-flex items-center gap-0.5 rounded normal-case font-normal transition-opacity outline-none",
          active
            ? "text-vc-main opacity-100"
            : "opacity-0 group-hover/header:opacity-60 hover:opacity-100!",
        )}
      >
        <IconFilter size={13} />
        {active && <span className="text-[10px] font-bold leading-none">{selected.length}</span>}
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", left: position.left, top: position.top }}
            className="z-999 min-w-40 rounded-md bg-vc-container border border-vc-line shadow-[0_16px_40px_-16px_rgba(0,0,0,0.55)] text-sm normal-case font-normal py-1"
          >
            <div className="max-h-64 overflow-y-auto py-1">
              {options.map((opt) => {
                const value = String(opt.value);
                const checked = selected.includes(value);
                return (
                  <label
                    key={value}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-vc-veil cursor-pointer"
                  >
                    <Checkbox checked={checked} onChange={() => toggleValue(value)} />
                    <span className={checked ? "text-vc-main font-medium" : "text-vc-secondary"}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
            {active && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full text-left px-3 py-2 text-xs text-vc-secondary/70 hover:text-vc-main border-t border-vc-line"
              >
                {t("table_filter_reset")}
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

function TableIconButton({
  tooltip,
  onClick,
  children,
  disabled,
  active,
  className,
}: {
  tooltip: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <TooltipButton tooltip={tooltip}>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={clsx(
          "flex h-7 w-7 items-center justify-center rounded-2xl transition-colors",
          active ? "bg-vc-main text-white" : "bg-vc-back text-vc-secondary hover:text-vc-text",
          disabled && "opacity-30 pointer-events-none",
          className,
        )}
      >
        {children}
      </button>
    </TooltipButton>
  );
}
