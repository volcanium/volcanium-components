import { Stepper } from "@lib";
import DocPage, { Example, PropsTable } from "../../components/DocPage";

const stages = [
  { title: "Sign up", content: "Create your account.", done: true },
  { title: "Verify email", content: "Confirm your email address.", done: true },
  { title: "Set up profile", content: "Add your name and avatar." },
  { title: "Invite your team", content: "Bring your teammates on board." },
];

export default function StepperDoc() {
  return (
    <DocPage name="Stepper" description={"Liste d'étapes numérotées, en colonne (linear) ou en alternance avec une ligne de progression (zigzag)."}>
      <Example title={"Disposition linear"} code={`const stages = [\n  { title: "Sign up", content: "Create your account.", done: true },\n  { title: "Verify email", content: "Confirm your email address.", done: true },\n  { title: "Set up profile", content: "Add your name and avatar." },\n  { title: "Invite your team", content: "Bring your teammates on board." },\n];\n\n<Stepper stages={stages} layout="linear" />`}>
        <Stepper stages={stages} layout="linear" />
      </Example>
      <Example title={"Disposition zigzag"} code={`<Stepper stages={stages} layout="zigzag" />`}>
        <Stepper stages={stages} layout="zigzag" />
      </Example>
      <PropsTable
        rows={[
          { name: "stages", type: "StepperItem[]", description: "{ title, content, sideContent?, done? }[]. sideContent n'est utilisé que par la disposition zigzag." },
          { name: "layout", type: '"linear" | "zigzag"', default: '"linear"', description: "Disposition des étapes." },
          { name: "className", type: "string", description: "Classes supplémentaires du conteneur." },
        ]}
      />
    </DocPage>
  );
}
