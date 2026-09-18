import { Loader } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function LoaderDoc() {
  return (
    <DocPage name="Loader" description="A thin animated progress bar used as a loading indicator, either inline or full-width.">
      <Example title="Inline (default width)" code={`<Loader />`}>
        <Loader />
      </Example>
      <Example title="Full width" code={`<div className="w-full"><Loader full /></div>`}>
        <div className="w-full">
          <Loader full />
        </div>
      </Example>
      <PropsTable
        rows={[
          { name: "hide", type: "boolean", description: "Fades the loader out (opacity 0) without unmounting it." },
          { name: "full", type: "boolean", default: "false", description: "Full width instead of a fixed w-32 bar." },
        ]}
      />
    </DocPage>
  );
}
