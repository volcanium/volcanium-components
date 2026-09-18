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
    <DocPage name="Stepper" description="Renders a list of numbered stages either as a single connected column (linear, formerly Cursus) or as a responsive alternating layout with a progress rail (zigzag, formerly RoadMap).">
      <Example title="Linear layout" code={`const stages = [\n  { title: "Sign up", content: "Create your account.", done: true },\n  { title: "Verify email", content: "Confirm your email address.", done: true },\n  { title: "Set up profile", content: "Add your name and avatar." },\n  { title: "Invite your team", content: "Bring your teammates on board." },\n];\n\n<Stepper stages={stages} layout="linear" />`}>
        <Stepper stages={stages} layout="linear" />
      </Example>
      <Example title="Zigzag layout" code={`<Stepper stages={stages} layout="zigzag" />`}>
        <Stepper stages={stages} layout="zigzag" />
      </Example>
      <PropsTable
        rows={[
          { name: "stages", type: "StepperItem[]", description: "{ title, content, sideContent?, done? }[]. sideContent is only used by the zigzag layout." },
          { name: "layout", type: '"linear" | "zigzag"', default: '"linear"', description: "Visual layout of the stages." },
          { name: "className", type: "string", description: "Extra classes on the outer wrapper." },
        ]}
      />
    </DocPage>
  );
}
