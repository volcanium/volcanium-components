import { ReactNode } from "react";

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-container text-left">
            <th className="p-2 px-3 font-semibold">Name</th>
            <th className="p-2 px-3 font-semibold">Type</th>
            <th className="p-2 px-3 font-semibold">Default</th>
            <th className="p-2 px-3 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-white/10 align-top">
              <td className="p-2 px-3 font-mono text-secondary whitespace-nowrap">
                {r.name}
              </td>
              <td className="p-2 px-3 font-mono text-white/70 whitespace-pre-wrap">
                {r.type}
              </td>
              <td className="p-2 px-3 font-mono text-white/50 whitespace-nowrap">
                {r.default ?? "—"}
              </td>
              <td className="p-2 px-3 text-white/80">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm font-mono leading-relaxed">
      <code>{code.trim()}</code>
    </pre>
  );
}

export function Example({
  title,
  children,
  code,
}: {
  title?: string;
  children: ReactNode;
  code: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {title && (
        <h3 className="text-lg font-semibold text-secondary">{title}</h3>
      )}
      <div className="rounded-xl p-6 flex flex-wrap gap-4 items-center border border-white/5">
        {children}
      </div>
      <CodeBlock code={code} />
    </div>
  );
}

export default function DocPage({
  name,
  description,
  children,
}: {
  name: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-title text-main">{name}</h1>
        <p className="text-white/70 max-w-2xl">{description}</p>
      </div>
      {children}
    </div>
  );
}
