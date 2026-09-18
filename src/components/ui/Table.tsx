import Center from "../layout/Center";
import { useState, useRef, useEffect, ReactNode } from "react";
import Title from "./Title";
import { AgGridReact } from "ag-grid-react";
import Button from "./Button";
import {
  ColDef,
  Column,
  RowSelectionOptions,
  themeQuartz,
  colorSchemeDark,
  CellClickedEvent,
  CellFocusedEvent,
  FilterChangedEvent,
  CellValueChangedEvent,
  RowDoubleClickedEvent,
} from "ag-grid-community";
import useKeyPress from "../../utils/useKeyPress";
import { useLanguage } from "../../utils/useLanguage";
import { notify } from "./notify";
import Loader from "./Loader";
import TableNewRowModal, { NewRowConfig } from "./TableNewRowModal";
import TableDeleteRowModal from "./TableDeleteRowModal";
import TableToolbar from "./TableToolbar";

const theme = themeQuartz.withPart(colorSchemeDark).withParams({
  accentColor: "#FF764C",
  backgroundColor: "#332c29",
});

export interface TableFilterOption {
  label: ReactNode;
  value: unknown;
}

/**
 * Filtre affiché sous forme de menu déroulant à côté de la recherche.
 * Sa valeur est incluse dans les paramètres transmis à `fetchMethod`
 * lorsque `serverSide` est activé.
 */
export interface TableFilter {
  key: string;
  label?: string;
  options: TableFilterOption[];
  defaultValue?: unknown;
  className?: string;
}

export interface TableFetchParams {
  search: string;
  page: number;
  pageSize: number;
  filters: Record<string, unknown>;
}

export interface TableFetchResult<Row> {
  data: Row[];
  total?: number;
}

/**
 * Composant de tableau de données avancé basé sur **AG Grid**.
 * Gère la recherche rapide, la sélection, l'édition de cellules, ainsi que les opérations CRUD.
 * Toutes les opérations de données (fetch, création, édition, suppression) sont fournies par le
 * consommateur : ce composant n'embarque aucun client HTTP par défaut.
 */
export interface TableProps<Row extends { id: string | number }> {
  colsDefs: ColDef<Row>[];
  title: string;
  rowSelection?: RowSelectionOptions<Row>;
  realodKey?: string | number;
  loading?: boolean;
  onSelect?: (selectedRows: Row[]) => void;
  /** Récupère les données. En mode `serverSide`, reçoit `{ search, page, pageSize, filters }` et doit retourner `Row[]` ou `{ data, total }`. */
  fetchMethod: (params?: TableFetchParams) => Promise<Row[] | TableFetchResult<Row>>;
  /** Configuration pour activer l'ajout de nouvelles lignes via une modale. */
  newRow?: NewRowConfig;
  /** Active la suppression automatique via une modale de confirmation. Requiert `deleteRequest`. */
  deleteRow?: boolean;
  /** Fonction de suppression appelée avec les lignes sélectionnées. Requise dès que `deleteRow` est actif. */
  deleteRequest?: (selectedRows: Row[]) => Promise<void>;
  /** Callback déclenchée lors d'un double-clic sur une ligne ou via le bouton d'ouverture. */
  openRequest?: (selectedRows: Row[]) => void;
  /** Callback appelée lors de l'édition d'une cellule, reçoit l'événement AG Grid. */
  modifMethod: (params: CellValueChangedEvent<Row>) => void;
  copyButton?: boolean;
  /**
   * Active la recherche, la pagination et les filtres côté serveur : la
   * saisie de recherche (débouncée), la page courante et les filtres sont
   * envoyés à `fetchMethod`.
   */
  serverSide?: boolean;
  pageSize?: number;
  filters?: TableFilter[];
  searchPlaceholder?: string;
}

export default function Table<Row extends { id: string | number }>({
  colsDefs,
  title,
  rowSelection,
  realodKey,
  loading = true,
  onSelect,
  deleteRequest,
  newRow,
  deleteRow,
  openRequest,
  fetchMethod,
  modifMethod,
  copyButton = false,
  serverSide = false,
  pageSize = 25,
  filters,
  searchPlaceholder,
}: TableProps<Row>) {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const gridRef = useRef<AgGridReact<Row>>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [rowData, setRowData] = useState<Row[] | undefined>();
  const [quickFilter, setQuickFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    filters?.forEach((f) => {
      initial[f.key] = f.defaultValue ?? f.options[0]?.value;
    });
    return initial;
  });
  const [reloadSpinning, setReloadSpinning] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Row[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; colDef: { field: string } } | null>(null);

  // Debounce la recherche saisie avant de déclencher un appel serveur.
  useEffect(() => {
    if (!serverSide) {
      setQuickFilter(searchInput);
      return;
    }
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput, serverSide]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const isEditingCellTarget = () => {
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    return active.classList.contains("ag-cell-editor") || !!active.closest?.(".ag-cell-editor");
  };

  useKeyPress("Delete", () => {
    if (isEditingCellTarget()) return;
    if (selectedRows.length > 0) (deleteRow ? deleteRowAuto : deleteRowMethod)();
  });

  useEffect(() => {
    setLoadingTable(loading);
  }, [loading]);

  const updateSelectedRows = () => {
    const selectedNodes = gridRef.current?.api?.getSelectedNodes() || [];
    const selectedData = selectedNodes.map((node) => node.data as Row);
    setSelectedRows(selectedData);
  };

  const getColId = (column: string | Column<Row> | null | undefined) => {
    if (!column) return "";
    if (typeof column === "string") return column;
    return column.getColId();
  };

  const handleCellClicked = (e: CellClickedEvent<Row>) => {
    if (e.rowIndex !== null && e.rowIndex !== undefined) {
      setSelectedCell({ rowIndex: e.rowIndex, colDef: { field: getColId(e.column) } });
    }
  };

  const handleCellFocusChanged = (e: CellFocusedEvent<Row>) => {
    if (e.rowIndex !== null && e.rowIndex !== undefined) {
      setSelectedCell({ rowIndex: e.rowIndex, colDef: { field: getColId(e.column) } });
    } else {
      setSelectedCell(null);
    }
  };

  useEffect(() => {
    onSelect?.(selectedRows);
  }, [selectedRows]);

  const handleClickBtnReload = () => {
    setReloadSpinning(false);
    setTimeout(() => setReloadSpinning(true), 600);
  };

  const fethData = async () => {
    if (serverSide) {
      const params: TableFetchParams = { search, page, pageSize, filters: filterValues };
      const res = await fetchMethod(params);
      const data = Array.isArray(res) ? res : res.data;
      const nextTotal = Array.isArray(res) ? res.length : res.total ?? data.length;
      setRowData(data);
      setTotal(nextTotal);
      setLoadingTable(false);
      return;
    }

    const res = await fetchMethod();
    setRowData(Array.isArray(res) ? res : res.data);
    setLoadingTable(false);
  };

  const deleteRowMethod = async () => {
    setLoadingTable(true);
    await deleteRequest?.(selectedRows);
    await reloadTable();
    setLoadingTable(false);
  };

  const onFilterChanged = (params: FilterChangedEvent<Row>) => {
    const count = params.api.getDisplayedRowCount();
    if (count === 0) {
      params.api.showNoRowsOverlay();
    } else {
      params.api.hideOverlay();
    }
  };

  const reloadTable = async () => {
    setLoadingTable(true);
    handleClickBtnReload();
    setRowData(undefined);
    await fethData();
  };

  const deleteRowAuto = () => {
    setModalDelete(true);
  };

  useEffect(() => {
    fethData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realodKey, serverSide && search, serverSide && page, serverSide && JSON.stringify(filterValues)]);

  useEffect(() => {
    if (gridRef.current?.api) {
      gridRef.current.api.sizeColumnsToFit();
    }
  }, [rowData, quickFilter]);

  useEffect(() => {
    const handlePageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cellClicked = target.closest(".ag-cell");
      const toolbarClicked = target.closest('[class*="bg-back-2"]');
      if (!cellClicked && !toolbarClicked) {
        setSelectedCell(null);
      }
    };

    document.addEventListener("click", handlePageClick, true);
    return () => document.removeEventListener("click", handlePageClick, true);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <Center className="p-5 flex flex-col text-left gap-5 w-full">
        <Title>{title}</Title>
        <TableToolbar
          serverSide={serverSide}
          searchInput={searchInput}
          quickFilter={quickFilter}
          searchPlaceholder={searchPlaceholder || t("table_search_placeholder")}
          onSearchChange={(value) =>
            serverSide ? setSearchInput(value) : setQuickFilter(value)
          }
          filters={filters}
          filterValues={filterValues}
          onFilterChange={(key, value) => {
            setFilterValues((prev) => ({ ...prev, [key]: value }));
            setPage(0);
          }}
          selectedCount={selectedRows.length}
          hasSelectedCell={!!selectedCell}
          copyButton={copyButton}
          reloadSpinning={reloadSpinning}
          onOpen={() => {
            setSelectedCell(null);
            openRequest?.(selectedRows);
          }}
          onDelete={deleteRowMethod}
          onCopy={() => setSelectedCell(null)}
          onPaste={() => setSelectedCell(null)}
          onReload={() => {
            setSelectedCell(null);
            reloadTable();
          }}
          onEditCell={() => {
            if (selectedCell) {
              gridRef.current?.api.startEditingCell({
                rowIndex: selectedCell.rowIndex,
                colKey: selectedCell.colDef.field,
              });
            }
          }}
          onUndo={() => {
            setSelectedCell(null);
            gridRef.current?.api.undoCellEditing();
          }}
          onRedo={() => {
            setSelectedCell(null);
            gridRef.current?.api.redoCellEditing();
          }}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
        <div
          className="ag-theme-alpine w-full"
          style={{ width: "100%" }}
          ref={gridContainerRef}
        >
          <AgGridReact<Row>
            onFilterChanged={onFilterChanged}
            loadingOverlayComponent={Loader}
            theme={theme}
            onSelectionChanged={updateSelectedRows}
            onCellClicked={handleCellClicked}
            onCellFocused={handleCellFocusChanged}
            onRowDoubleClicked={(e: RowDoubleClickedEvent<Row>) => e.data && openRequest?.([e.data])}
            ref={gridRef}
            suppressClickEdit={true}
            defaultColDef={{ resizable: false }}
            noRowsOverlayComponent={() => <div>{t("table_no_results")}</div>}
            loading={loadingTable}
            domLayout="autoHeight"
            quickFilterText={serverSide ? undefined : quickFilter}
            rowSelection={rowSelection}
            undoRedoCellEditing={true}
            onCellValueChanged={modifMethod}
            rowData={rowData}
            columnDefs={colsDefs}
            onGridReady={(params) => params.api.sizeColumnsToFit()}
          />
        </div>
      </Center>
      {newRow && (
        <TableNewRowModal
          setShowModal={setShowModal}
          showModal={showModal}
          reloadTable={reloadTable}
          newRow={newRow}
        />
      )}
      {newRow && (
        <Center>
          <Button onClick={() => setShowModal(true)}>
            {newRow.button?.name || newRow.modal.title}
          </Button>
        </Center>
      )}
      {deleteRow && deleteRequest && (
        <TableDeleteRowModal
          modalDelete={modalDelete}
          setModalDelete={setModalDelete}
          reloadTable={reloadTable}
          selectedRows={selectedRows}
          deleteRequest={deleteRequest}
        />
      )}
    </div>
  );
}
