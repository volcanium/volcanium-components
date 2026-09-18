import { useState } from "react";
import { Table } from "@lib";
import type { ColDef } from "ag-grid-community";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

interface Row {
  id: number;
  name: string;
  email: string;
  role: string;
}

const allRows: Row[] = Array.from({ length: 42 }).map((_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "admin" : "member",
}));

const colsDefs: ColDef<Row>[] = [
  { field: "id", headerName: "ID", maxWidth: 80 },
  { field: "name", headerName: "Name", editable: true },
  { field: "email", headerName: "Email", editable: true },
  { field: "role", headerName: "Role" },
];

export default function TableDoc() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <DocPage
      name="Table"
      description="Data table built on AG Grid: quick search, pagination, filters, cell editing and CRUD hooks. All data operations (fetch, create, delete) are supplied by the consumer via callbacks — the component itself has no HTTP client."
    >
      <Example
        title="Client-side data"
        code={`const colsDefs = [\n  { field: "id", headerName: "ID", maxWidth: 80 },\n  { field: "name", headerName: "Name", editable: true },\n  { field: "email", headerName: "Email", editable: true },\n  { field: "role", headerName: "Role" },\n];\n\n<Table\n  title="Users"\n  colsDefs={colsDefs}\n  fetchMethod={async () => allRows}\n  modifMethod={(e) => console.log("cell changed", e)}\n/>`}
      >
        <div className="w-full">
          <Table<Row>
            title="Users"
            colsDefs={colsDefs}
            fetchMethod={async () => allRows}
            modifMethod={(e) => console.log("cell changed", e)}
            realodKey={reloadKey}
          />
        </div>
      </Example>

      <Example
        title="Server-side search, pagination and filters"
        code={`<Table\n  title="Users (server-side)"\n  colsDefs={colsDefs}\n  serverSide\n  pageSize={10}\n  filters={[{\n    key: "role",\n    label: "Role",\n    options: [{ label: "All", value: "" }, { label: "Admin", value: "admin" }, { label: "Member", value: "member" }],\n  }]}\n  fetchMethod={async ({ search, page, pageSize, filters }) => {\n    const filtered = allRows.filter((r) =>\n      (!search || r.name.toLowerCase().includes(search.toLowerCase())) &&\n      (!filters.role || r.role === filters.role),\n    );\n    const start = page * pageSize;\n    return { data: filtered.slice(start, start + pageSize), total: filtered.length };\n  }}\n  modifMethod={() => {}}\n/>`}
      >
        <div className="w-full">
          <Table<Row>
            title="Users (server-side)"
            colsDefs={colsDefs}
            serverSide
            pageSize={10}
            filters={[
              {
                key: "role",
                label: "Role",
                options: [
                  { label: "All", value: "" },
                  { label: "Admin", value: "admin" },
                  { label: "Member", value: "member" },
                ],
              },
            ]}
            fetchMethod={async (params) => {
              const search = params?.search ?? "";
              const page = params?.page ?? 0;
              const pageSize = params?.pageSize ?? 10;
              const roleFilter = (params?.filters?.role as string) ?? "";
              const filtered = allRows.filter(
                (r) =>
                  (!search || r.name.toLowerCase().includes(search.toLowerCase())) &&
                  (!roleFilter || r.role === roleFilter),
              );
              const start = page * pageSize;
              return { data: filtered.slice(start, start + pageSize), total: filtered.length };
            }}
            modifMethod={() => {}}
          />
        </div>
      </Example>

      <PropsTable
        rows={[
          { name: "colsDefs", type: "ColDef<Row>[]", description: "AG Grid column definitions." },
          { name: "title", type: "string", description: "Table title." },
          { name: "fetchMethod", type: "(params?: TableFetchParams) => Promise<Row[] | { data, total? }>", description: "Loads data. In serverSide mode, receives { search, page, pageSize, filters }." },
          { name: "modifMethod", type: "(params: CellValueChangedEvent<Row>) => void", description: "Called when a cell is edited." },
          { name: "rowSelection", type: "RowSelectionOptions<Row>", description: "AG Grid row selection config, e.g. { mode: \"multiRow\" }." },
          { name: "realodKey", type: "string | number", description: "Changing this value forces a data reload." },
          { name: "loading", type: "boolean", default: "true", description: "External loading flag, shown as the grid overlay." },
          { name: "onSelect", type: "(rows: Row[]) => void", description: "Called with the current row selection." },
          { name: "newRow", type: "NewRowConfig", description: "Configuration to enable a \"new row\" modal + button." },
          { name: "deleteRow", type: "boolean", description: "Enables delete via a confirmation modal (requires deleteRequest)." },
          { name: "deleteRequest", type: "(rows: Row[]) => Promise<void>", description: "Deletes the given rows; required when deleteRow is set." },
          { name: "openRequest", type: "(rows: Row[]) => void", description: "Called on row double-click or the toolbar's open button." },
          { name: "copyButton", type: "boolean", default: "false", description: "Shows a copy-selection toolbar button." },
          { name: "serverSide", type: "boolean", default: "false", description: "Enables server-driven search/pagination/filters." },
          { name: "pageSize", type: "number", default: "25", description: "Rows per page in serverSide mode." },
          { name: "filters", type: "TableFilter[]", description: "Dropdown filters shown next to the search box; values are sent to fetchMethod." },
          { name: "searchPlaceholder", type: "string", description: "Search input placeholder." },
        ]}
      />
    </DocPage>
  );
}
