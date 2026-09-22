import { useRef, useState, ReactNode } from "react";
import clsx from "clsx";
import { IconPhoto, IconCheck } from "@tabler/icons-react";
import Input from "./Input";
import Textarea from "./Textarea";
import Select from "./Select";

export type TableCellType = "text" | "input" | "textarea" | "checkbox" | "img" | "select";

export interface TableCellValueParams<Row> {
  value: any;
  data: Row;
}

export interface TableColumnDef<Row = any> {
  field: string;
  headerName: string;
  /**
   * Type de cellule. Par defaut deduit automatiquement : "checkbox" si la
   * valeur est un booleen, sinon "input" si `editable`, sinon "text".
   */
  type?: TableCellType;
  editable?: boolean;
  /** Desactive le filtre colonne pour ce champ (actif par defaut, sauf pour "img"). */
  filterable?: boolean;
  /** Desactive le tri pour ce champ (actif par defaut, sauf pour "img"). */
  sortable?: boolean;
  /** Options pour type "select". */
  options?: { label: string; value: any }[];
  valueFormatter?: (params: TableCellValueParams<Row>) => string;
  cellRenderer?: (params: TableCellValueParams<Row>) => ReactNode;
  onImageClick?: (params: TableCellValueParams<Row>) => void;
  className?: string;
}

export interface TableCellProps<Row> {
  column: TableColumnDef<Row>;
  value: any;
  row: Row;
  editing: boolean;
  onStartEdit: () => void;
  onCommit: (value: any) => void;
  onCancel: () => void;
}

/** Hauteur uniforme de toute cellule (lecture ou edition), pour qu'une ligne
 * ne bouge jamais lorsqu'on entre/sort du mode edition. */
export const TABLE_ROW_HEIGHT = "h-9";

function displayValue<Row>(column: TableColumnDef<Row>, value: any, row: Row): ReactNode {
  if (column.cellRenderer) return column.cellRenderer({ value, data: row });
  if (column.valueFormatter) return column.valueFormatter({ value, data: row });
  if (column.type === "select" && column.options) {
    return column.options.find((o) => o.value === value)?.label ?? String(value ?? "");
  }
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

function resolveType(column: TableColumnDef<any>, value: any): TableCellType {
  if (column.type) return column.type;
  if (typeof value === "boolean") return "checkbox";
  return column.editable ? "input" : "text";
}

export default function TableCell<Row>({
  column,
  value,
  row,
  editing,
  onStartEdit,
  onCommit,
  onCancel,
}: TableCellProps<Row>) {
  const effectiveType = resolveType(column, value);

  // --- Type "checkbox": bascule directe au clic, jamais de mode edition separe ---
  if (effectiveType === "checkbox") {
    return (
      <div className={clsx(TABLE_ROW_HEIGHT, "flex items-center")}>
        <button
          type="button"
          disabled={!column.editable}
          onClick={(e) => {
            e.stopPropagation();
            if (column.editable) onCommit(!value);
          }}
          aria-checked={!!value}
          role="checkbox"
          className={clsx(
            "flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-150",
            value ? "bg-vc-main border-vc-main" : "bg-vc-container border-vc-secondary/25",
            column.editable
              ? "cursor-pointer hover:border-vc-main/60 active:scale-90"
              : "cursor-default",
          )}
        >
          {value && <IconCheck size={13} strokeWidth={3} className="text-white" />}
        </button>
      </div>
    );
  }

  // --- Type "img": vignette, ouvre onImageClick au clic si fourni ---
  if (effectiveType === "img") {
    // `valueFormatter`, si fourni, calcule l'URL de la vignette a partir de
    // toute la ligne (ex: construire une URL de previsualisation selon
    // d'autres champs) - sinon la valeur brute du champ est utilisee telle quelle.
    const src = column.valueFormatter ? column.valueFormatter({ value, data: row }) : value;
    return (
      <div className={clsx(TABLE_ROW_HEIGHT, "flex items-center")}>
        {src ? (
          <img
            src={src}
            alt=""
            onClick={(e) => {
              if (!column.onImageClick) return;
              e.stopPropagation();
              column.onImageClick({ value, data: row });
            }}
            className={clsx(
              "h-8 w-8 rounded-lg object-cover ring-1 ring-vc-line transition-all duration-150",
              column.onImageClick && "cursor-pointer hover:ring-vc-main/50 hover:scale-105",
            )}
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vc-veil text-vc-secondary/40">
            <IconPhoto size={15} />
          </div>
        )}
      </div>
    );
  }

  // --- Modes lecture (text / input / textarea / select non en edition) ---
  if (!editing) {
    const content = displayValue(column, value, row);
    return (
      <div
        onClick={(e) => {
          if (!column.editable) return;
          e.stopPropagation();
          onStartEdit();
        }}
        title={column.editable ? "Cliquer pour modifier" : undefined}
        className={clsx(
          TABLE_ROW_HEIGHT,
          "flex items-center rounded-lg px-1 -mx-1 truncate transition-colors duration-150",
          column.editable && "cursor-text hover:bg-vc-veil",
        )}
      >
        <span className="truncate">
          {content || (column.editable && <span className="text-vc-secondary/30">—</span>)}
        </span>
      </div>
    );
  }

  // --- Modes edition ---
  if (effectiveType === "select") {
    return (
      <InlineSelectEditor
        options={column.options || []}
        value={value}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );
  }

  if (effectiveType === "textarea") {
    return (
      <InlineTextEditor
        multiline
        initialValue={value ?? ""}
        onCommit={onCommit}
        onCancel={onCancel}
      />
    );
  }

  return <InlineTextEditor initialValue={value ?? ""} onCommit={onCommit} onCancel={onCancel} />;
}

function InlineTextEditor({
  initialValue,
  multiline,
  onCommit,
  onCancel,
}: {
  initialValue: string;
  multiline?: boolean;
  onCommit: (v: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initialValue);
  const committed = useRef(false);

  const commit = () => {
    if (committed.current) return;
    committed.current = true;
    onCommit(draft);
  };

  const cancel = () => {
    if (committed.current) return;
    committed.current = true;
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    } else if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commit();
    } else if (e.key === "Enter" && multiline && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      commit();
    }
  };

  if (multiline) {
    return (
      <Textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={clsx(TABLE_ROW_HEIGHT, "w-full! min-w-40! py-1! leading-tight")}
        resize="vertical"
      />
    );
  }

  return (
    <div className={clsx(TABLE_ROW_HEIGHT, "flex items-center -mx-1")}>
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="w-full! h-9! py-0! box-border"
      />
    </div>
  );
}

function InlineSelectEditor({
  options,
  value,
  onCommit,
  onCancel,
}: {
  options: { label: string; value: any }[];
  value: any;
  onCommit: (v: any) => void;
  onCancel: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={clsx(TABLE_ROW_HEIGHT, "flex items-center -mx-1")}
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        options={options}
        value={value}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onCancel();
        }}
        onChange={(v) => {
          setOpen(false);
          onCommit(v);
        }}
        className="w-fit! min-w-32! h-9!"
      />
    </div>
  );
}
