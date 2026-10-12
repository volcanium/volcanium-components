import { useState } from "react";
import DocPage, { Example, PropsTable } from "../../components/DocPage";
import { Button, FullPageLoader } from "@lib";

export default function FullPageLoaderDoc() {
  const [show, setShow] = useState(false);
  return (
    <DocPage name="FullPageLoader" description="A fixed, full-viewport overlay with a centered Loader, for the case where the whole page is just waiting (e.g. a slow redirect). Prefer it to `<Loader full />` on its own.">
      <Example title="Overlay (click to show for 2 s)" code={`{loading && <FullPageLoader />}`}>
        <Button onClick={() => { setShow(true); setTimeout(() => setShow(false), 2000); }}>Show loader</Button>
        {show && <FullPageLoader />}
      </Example>
      <PropsTable rows={[{ name: "hide", type: "boolean", description: "Hides the bar (same as Loader)." }]} />
    </DocPage>
  );
}
