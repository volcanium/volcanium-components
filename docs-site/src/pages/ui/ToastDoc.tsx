import { Button, notify } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function ToastDoc() {
  return (
    <DocPage
      name="ToastProvider / notify"
      description="ToastProvider renders a toast stack (top-right) and registers itself as the global handler for notify.*. Mount ToastProvider once near the root (this docs site does it in main.tsx) and call notify.info/success/warn/error(message, durationMs?) from anywhere."
    >
      <Example code={`import { notify } from "@volcanium/volcanium-components";\n\nnotify.info("Heads up!");\nnotify.success("Saved successfully");\nnotify.warn("Careful with that");\nnotify.error("Something went wrong");`}>
        <Button onClick={() => notify.info("Heads up!")}>notify.info</Button>
        <Button variant="secondary" onClick={() => notify.success("Saved successfully")}>notify.success</Button>
        <Button variant="tertiary" onClick={() => notify.warn("Careful with that")}>notify.warn</Button>
        <Button variant="lum" onClick={() => notify.error("Something went wrong")}>notify.error</Button>
      </Example>

      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "ToastProviderProps: the rest of the app tree, rendered alongside the toast stack." },
        ]}
      />
      <p className="text-white/60 text-sm">
        Only the most recently mounted ToastProvider receives notify.* calls — there is no
        queueing across multiple providers.
      </p>
    </DocPage>
  );
}
