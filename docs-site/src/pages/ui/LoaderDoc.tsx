import { Loader } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function LoaderDoc() {
  return (
    <DocPage name="Loader" description={"Fine barre animée indiquant un chargement, de largeur fixe ou pleine."}>
      <Example title={"Largeur par défaut"} code={`<Loader />`}>
        <Loader />
      </Example>
      <Example title={"Pleine largeur"} code={`<div className="w-full"><Loader full /></div>`}>
        <div className="w-full">
          <Loader full />
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "hide", type: "boolean", description: "Masque la barre en fondu sans la retirer." },
          { name: "full", type: "boolean", default: "false", description: "Pleine largeur au lieu d'une barre fixe (w-32)." },
        ]}
      />
    </DocPage>
  );
}
