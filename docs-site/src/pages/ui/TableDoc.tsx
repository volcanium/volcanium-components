import { useState } from "react";
import { Table } from "@lib";
import type { TableColumnDef } from "@lib";
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

const colsDefs: TableColumnDef<Row>[] = [
  { field: "id", headerName: "ID" },
  { field: "name", headerName: "Name", editable: true },
  { field: "email", headerName: "Email", editable: true },
  { field: "role", headerName: "Role" },
];

export default function TableDoc() {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <DocPage
      name="Table"
      description={"Tableau de données avec recherche, pagination, filtres et modification des cellules. Le chargement, la création et la suppression se font par vos propres fonctions."}
    >
      <Example
        title={"Données côté client"}
        code={`const colsDefs = [\n  { field: "id", headerName: "ID" },\n  { field: "name", headerName: "Name", editable: true },\n  { field: "email", headerName: "Email", editable: true },\n  { field: "role", headerName: "Role" },\n];\n\n<Table\n  title="Users"\n  colsDefs={colsDefs}\n  fetchMethod={async () => allRows}\n  modifMethod={(e) => console.log("cell changed", e)}\n/>`}
      >
        <div className="w-full">
          <Table<Row>
            title="Users"
            colsDefs={colsDefs}
            fetchMethod={async () => allRows}
            modifMethod={(e) => console.log("cell changed", e)}
            reloadKey={reloadKey}
          />
        </div>
      </Example>

      <Example
        title={"Recherche et pagination côté serveur"}
        code={`<Table\n  title="Users (server-side)"\n  colsDefs={colsDefs}\n  serverSide\n  pageSize={10}\n  fetchMethod={async ({ search, page, pageSize, filters }) => {\n    const filtered = allRows.filter((r) =>\n      (!search || r.name.toLowerCase().includes(search.toLowerCase())) &&\n      (!filters.role || r.role === filters.role),\n    );\n    const start = page * pageSize;\n    return { data: filtered.slice(start, start + pageSize), total: filtered.length };\n  }}\n  modifMethod={() => {}}\n/>`}
      >
        <div className="w-full">
          <Table<Row>
            title="Users (server-side)"
            colsDefs={colsDefs}
            serverSide
            pageSize={10}
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
          { name: "colsDefs", type: "TableColumnDef<Row>[]", description: "Définition des colonnes (TableColumnDef)." },
          { name: "title", type: "string", description: "Titre du tableau." },
          { name: "fetchMethod", type: "(params?: TableFetchParams) => Promise<Row[] | { data, total? }>", description: "Charge les données. En mode serverSide, reçoit { search, page, pageSize, filters }." },
          { name: "modifMethod", type: "(params: CellValueChangedEvent<Row>) => void", description: "Appelée à la modification d'une cellule." },
          { name: "rowSelection", type: "RowSelectionOptions<Row>", description: "Sélection des lignes, par exemple { mode: \"multiRow\" }." },
          { name: "reloadKey", type: "string | number", description: "Changer cette valeur recharge les données." },
          { name: "loading", type: "boolean", default: "true", description: "Indicateur de chargement externe, affiché sur le tableau." },
          { name: "onSelect", type: "(rows: Row[]) => void", description: "Appelée avec les lignes sélectionnées." },
          { name: "newRow", type: "NewRowConfig", description: "Configuration du bouton et de la fenêtre d'ajout de ligne." },
          { name: "deleteRow", type: "boolean", description: "Active la suppression avec confirmation (nécessite deleteRequest)." },
          { name: "deleteRequest", type: "(rows: Row[]) => Promise<void>", description: "Supprime les lignes ; obligatoire avec deleteRow." },
          { name: "openRequest", type: "(rows: Row[]) => void", description: "Appelée au double-clic sur une ligne ou au clic sur Ouvrir." },
          { name: "copyButton", type: "boolean", default: "false", description: "Affiche le bouton de copie de la sélection." },
          { name: "serverSide", type: "boolean", default: "false", description: "Active la recherche, la pagination et les filtres côté serveur." },
          { name: "pageSize", type: "number", default: "25", description: "Lignes par page en mode serverSide." },
          { name: "searchPlaceholder", type: "string", description: "Texte indicatif de la recherche." },
        ]}
      />
    </DocPage>
  );
}
