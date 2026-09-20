import { useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { Squircle } from "@squircle-js/react";
import clsx from "clsx";
import {
  IconFilter,
  IconFilterOff,
  IconTrash,
  IconRefresh,
  IconPlus,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconExternalLink,
} from "@tabler/icons-react";
import Title from "./Title";
import Input from "./Input";
import Select from "./Select";
import Loader from "./Loader";
import TooltipButton from "./TooltipButton";
import TableCell, { TableColumnDef } from "./TableCell";
import TableNewRowModal, { NewRowConfig } from "./TableNewRowModal";
import TableDeleteRowModal from "./TableDeleteRowModal";
import { notify } from "./notify";
import { useLanguage } from "../../utils/useLanguage";

export type { TableColumnDef, TableCellType, TableCellValueParams } from "./TableCell";

interface TableFetchResult<Row> {
  data: Row[];
  total?: number;
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
  fetchMethod: () => Promise<Row[] | TableFetchResult<Row>>;
  /** Active la colonne de cases a cocher + les actions de selection. Desactive par defaut. */
  selectable?: boolean;
  onSelect?: (selectedRows: Row[]) => void;
  deleteRow?: boolean;
  deleteRequest?: (selectedRows: Row[]) => Promise<void>;
  openRequest?: (selectedRows: Row[]) => void;
  modifMethod?: (params: CellValueChangedEvent<Row>) => void;
  newRow?: NewRowConfig;
  searchPlaceholder?: string;
  className?: string;
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
}: TableProps<Row>) {
  const { t } = useLanguage();
  const [data, setData] = useState<Row[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [reloadSpinning, setReloadSpinning] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sort, setSort] = useState<{ field: string; dir: 1 | -1 } | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<any>>(new Set());
  const [editingCell, setEditingCell] = useState<{ rowKey: any; field: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [past, setPast] = useState<EditAction[]>([]);
  const [future, setFuture] = useState<EditAction[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);

  const loading = loadingData;
  const getRowKey = (row: Row) => (row as any)[rowKey];

  const loadData = async () => {
    setLoadingData(true);
    setReloadSpinning(false);
    setTimeout(() => setReloadSpinning(true), 50);
    try {
      const res = await fetchMethod();
      const rows = Array.isArray(res) ? res : res.data;
      setData(rows);
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

  const filterableCols = colsDefs.filter((c) => c.filterable !== false && c.type !== "img");

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
    let rows = data;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((row) =>
        colsDefs.some((c) => c.type !== "img" && getDisplayText(c, row).toLowerCase().includes(q)),
      );
    }

    for (const [field, value] of Object.entries(filters)) {
      if (value === "" || value === undefined || value === null) continue;
      const col = colsDefs.find((c) => c.field === field);
      if (!col) continue;
      if (col.type === "select" || isCheckboxLike(col)) {
        rows = rows.filter((row) => String((row as any)[field]) === String(value));
      } else {
        const q = String(value).toLowerCase();
        rows = rows.filter((row) => getDisplayText(col, row).toLowerCase().includes(q));
      }
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
  }, [data, search, filters, sort, colsDefs]);

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
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "" && v !== undefined && v !== null);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
      className={clsx("flex flex-col gap-2 w-full", className)}
    >
      <Squircle cornerRadius={20} cornerSmoothing={1} asChild>
        <div className="flex flex-col gap-4 p-5 text-left bg-container border border-line w-full">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Title>{title}</Title>
            <div className="flex items-center gap-1.5">
              {selectable && selectedRows.length > 0 && (
                <>
                  <span className="text-sm text-secondary/70 mr-1">
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
                  <div className="h-5 w-px bg-line mx-1" />
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
              {filterableCols.length > 0 && (
                <TableIconButton
                  tooltip={showFilters ? t("table_hide_filters") : t("table_show_filters")}
                  active={showFilters || hasActiveFilters}
                  onClick={() => setShowFilters((v) => !v)}
                >
                  {showFilters ? <IconFilterOff size={16} /> : <IconFilter size={16} />}
                </TableIconButton>
              )}
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

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line">
                  {selectable && (
                    <th className="w-10 py-2 pr-2">
                      <Checkbox checked={allVisibleSelected} onChange={toggleAll} />
                    </th>
                  )}
                  {colsDefs.map((col) => (
                    <th
                      key={col.field}
                      className={clsx(
                        "py-2 px-2 text-left font-medium text-secondary/70 select-none whitespace-nowrap",
                        col.sortable !== false && "cursor-pointer hover:text-secondary",
                      )}
                      onClick={() => col.sortable !== false && toggleSort(col.field)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.headerName}
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
                      </span>
                    </th>
                  ))}
                </tr>
                {showFilters && (
                  <tr className="border-b border-line">
                    {selectable && <th className="py-1.5 pr-2" />}
                    {colsDefs.map((col) => (
                      <th key={col.field} className="py-1.5 px-2 font-normal">
                        {col.filterable === false || col.type === "img" ? null : col.type ===
                            "select" || isCheckboxLike(col) ? (
                          <Select
                            className="w-full! min-w-28!"
                            placeholder={t("table_filter_all")}
                            value={filters[col.field] ?? ""}
                            onChange={(v) => setFilters((f) => ({ ...f, [col.field]: v }))}
                            options={[
                              { label: t("table_filter_all"), value: "" },
                              ...(isCheckboxLike(col)
                                ? [
                                    { label: t("table_filter_yes"), value: "true" },
                                    { label: t("table_filter_no"), value: "false" },
                                  ]
                                : col.options || []),
                            ]}
                          />
                        ) : (
                          <Input
                            variant="secondary"
                            className="w-full! min-w-24! py-1!"
                            value={filters[col.field] ?? ""}
                            onChange={(e) => setFilters((f) => ({ ...f, [col.field]: e.target.value }))}
                          >
                            {t("table_filter_placeholder")}
                          </Input>
                        )}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {loading && (
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
                      className="py-10 text-center text-secondary/50"
                    >
                      {t("table_no_results")}
                    </td>
                  </tr>
                )}
                {!loading &&
                  visibleRows.map((row) => {
                    const key = getRowKey(row);
                    return (
                      <tr
                        key={key}
                        onDoubleClick={() => openRequest?.([row])}
                        className={clsx(
                          "border-b border-line/60 last:border-b-0 transition-colors",
                          selectedKeys.has(key) ? "bg-main/10" : "hover:bg-veil",
                        )}
                      >
                        {selectable && (
                          <td className="py-1.5 pr-2 align-middle">
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
        "flex h-4.5 w-4.5 items-center justify-center rounded-md border transition-colors cursor-pointer",
        checked ? "bg-main border-main" : "bg-container border-secondary/30 hover:border-main/50",
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
          active ? "bg-main text-white" : "bg-back-2 text-secondary hover:text-text",
          disabled && "opacity-30 pointer-events-none",
          className,
        )}
      >
        {children}
      </button>
    </TooltipButton>
  );
}
