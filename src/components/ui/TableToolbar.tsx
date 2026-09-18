import { ReactNode } from "react";
import clsx from "clsx";
import TooltipButton from "./TooltipButton";
import Input from "./Input";
import Select from "./Select";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCopy,
  IconClipboard,
  IconRefresh,
  IconTrash,
  IconFileImport,
  IconEdit,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { useLanguage } from "../../utils/useLanguage";
import type { TableFilter } from "./Table";

export interface ButtonTableProps {
  tooltip: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ButtonTable({ tooltip, children, onClick, className }: ButtonTableProps) {
  return (
    <TooltipButton tooltip={tooltip}>
      <div
        className={clsx(
          `bg-back-2 rounded-2xl p-1 transition-transform w-7 h-7 flex items-center justify-center`,
          className,
        )}
        onClick={onClick}
      >
        {children}
      </div>
    </TooltipButton>
  );
}

export interface TableToolbarProps {
  serverSide: boolean;
  searchInput: string;
  quickFilter: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  filters?: TableFilter[];
  filterValues: Record<string, unknown>;
  onFilterChange: (key: string, value: unknown) => void;
  selectedCount: number;
  hasSelectedCell: boolean;
  copyButton: boolean;
  reloadSpinning: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onReload: () => void;
  onEditCell: () => void;
  onUndo: () => void;
  onRedo: () => void;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function TableToolbar({
  serverSide,
  searchInput,
  quickFilter,
  searchPlaceholder,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
  selectedCount,
  hasSelectedCell,
  copyButton,
  reloadSpinning,
  onOpen,
  onDelete,
  onCopy,
  onPaste,
  onReload,
  onEditCell,
  onUndo,
  onRedo,
  page,
  totalPages,
  total,
  onPageChange,
}: TableToolbarProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-1 w-full max-w-full">
      <div className="flex flex-row gap-1 justify-between">
        <div className="flex flex-1 flex-row items-center gap-2">
          <Input
            variant="secondary"
            className="w-100! py-0.5!"
            value={serverSide ? searchInput : quickFilter}
            onChange={(e) => onSearchChange(e.target.value)}
          >
            {searchPlaceholder}
          </Input>
          {filters?.map((f) => (
            <Select
              key={f.key}
              className={f.className || "w-40!"}
              options={f.options}
              value={filterValues[f.key]}
              onChange={(v) => onFilterChange(f.key, v)}
              placeholder={f.label}
            />
          ))}
          <p
            className={`flex-row flex-1 gap-1  text-left  text-nowrap ${selectedCount > 0 ? "flex" : "hidden"}`}
          >
            {selectedCount === 1
              ? t("table_selected_one", { count: selectedCount })
              : t("table_selected_many", { count: selectedCount })}
          </p>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <div className={`flex-row gap-1 items-center ${selectedCount > 0 ? "flex" : "hidden"}`}>
            <ButtonTable
              tooltip={t("table_open")}
              className={selectedCount === 1 ? "flex" : "hidden"}
              onClick={onOpen}
            >
              <IconFileImport />
            </ButtonTable>
            <ButtonTable tooltip={t("table_delete_selection")} onClick={onDelete}>
              <IconTrash />
            </ButtonTable>
            {copyButton && (
              <ButtonTable tooltip={t("table_copy_selection")} onClick={onCopy}>
                <IconCopy />
              </ButtonTable>
            )}
          </div>
          <div className={`flex-row gap-1 items-center ${hasSelectedCell ? "flex" : "hidden"}`}>
            <ButtonTable tooltip={t("table_edit_cell")} onClick={onEditCell}>
              <IconEdit />
            </ButtonTable>
          </div>
          <div
            className={`h-5 w-0.5 mx-2 rounded-5xl bg-white/20 ${hasSelectedCell || selectedCount > 0 ? "flex" : "hidden"}`}
          ></div>
          {copyButton && (
            <ButtonTable tooltip={t("table_paste_selection")} onClick={onPaste}>
              <IconClipboard />
            </ButtonTable>
          )}
          <ButtonTable
            className={reloadSpinning ? "-rotate-180 duration-0" : "duration-500"}
            tooltip={t("table_reload")}
            onClick={onReload}
          >
            <IconRefresh />
          </ButtonTable>
          <ButtonTable tooltip={t("table_undo")} onClick={onUndo}>
            <IconArrowBackUp />
          </ButtonTable>
          <ButtonTable tooltip={t("table_redo")} onClick={onRedo}>
            <IconArrowForwardUp />
          </ButtonTable>
        </div>
      </div>
      {serverSide && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="text-xs text-white/50">
            {t("table_results", {
              count: total,
              plural: total > 1 ? "s" : "",
              page: page + 1,
              totalPages,
            })}
          </p>
          <div className="flex items-center gap-2">
            <ButtonTable
              tooltip={t("table_previous_page")}
              className={page === 0 ? "opacity-30 pointer-events-none" : ""}
              onClick={() => onPageChange(Math.max(0, page - 1))}
            >
              <IconChevronLeft />
            </ButtonTable>
            <ButtonTable
              tooltip={t("table_next_page")}
              className={page >= totalPages - 1 ? "opacity-30 pointer-events-none" : ""}
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            >
              <IconChevronRight />
            </ButtonTable>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableToolbar;
