import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { ThemeToggle } from "@lib";

export default function ThemeToggleDoc() {
  return (
    <DocPage name="ThemeToggle" description={"Interrupteur entre thème sombre et thème clair. Le choix est mémorisé sous volcanium-theme et partagé par toutes les applications Volcanium (désactivable avec themeStorageKey={false} sur le fournisseur)."}>
      <Example title={"Exemple de base"} code={`<ThemeToggle />`}>
        <ThemeToggle />
      </Example>
      <PropsTable rows={[{ name: "className", type: "string", description: "Classes supplémentaires." }]} />
    </DocPage>
  );
}
