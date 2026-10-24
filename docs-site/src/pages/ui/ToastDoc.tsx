import { Button, notify } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

export default function ToastDoc() {
  return (
    <DocPage
      name="ToastProvider / notify"
      description={"ToastProvider affiche les notifications en haut à droite et reçoit les appels notify.*. Placez-le une seule fois à la racine, puis appelez notify.info, success, warn ou error(message, durationMs?) où vous voulez."}
    >
      <Example code={`import { notify } from "@volcanium/volcanium-components";\n\nnotify.info("Heads up!");\nnotify.success("Saved successfully");\nnotify.warn("Careful with that");\nnotify.error("Something went wrong");`}>
        <Button onClick={() => notify.info("Heads up!")}>notify.info</Button>
        <Button variant="secondary" onClick={() => notify.success("Saved successfully")}>notify.success</Button>
        <Button variant="tertiary" onClick={() => notify.warn("Careful with that")}>notify.warn</Button>
        <Button variant="lum" onClick={() => notify.error("Something went wrong")}>notify.error</Button>
      </Example>

      <PropsTable
        rows={[
          { name: "children", type: "ReactNode", description: "Le reste de l'application, affiché avec les notifications." },
        ]}
      />
      <p className="text-white/60 text-sm">
        Seul le ToastProvider monté en dernier reçoit les appels notify.*.
      </p>
    </DocPage>
  );
}
