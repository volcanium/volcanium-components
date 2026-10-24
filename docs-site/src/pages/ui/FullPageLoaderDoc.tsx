import { useState } from "react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { Button, FullPageLoader } from "@lib";

export default function FullPageLoaderDoc() {
  const [show, setShow] = useState(false);
  return (
    <DocPage name="FullPageLoader" description={"Calque plein écran avec un Loader centré, pour une page entière en attente (redirection lente, par exemple)."}>
      <Example title={"Calque (s'affiche 2 secondes au clic)"} code={`{loading && <FullPageLoader />}`}>
        <Button onClick={() => { setShow(true); setTimeout(() => setShow(false), 2000); }}>Show loader</Button>
        {show && <FullPageLoader />}
      </Example>
      <PropsTable rows={[{ name: "hide", type: "boolean", description: "Masque la barre (comme Loader)." }]} />
    </DocPage>
  );
}
