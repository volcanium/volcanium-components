import { useState, ChangeEvent, FormEvent, ReactNode, InputHTMLAttributes } from "react";
import Button from "./Button";
import Input from "./Input";
import Textarea, { TextareaProps } from "./Textarea";
import Select, { SelectOption } from "./Select";
import Toggle from "./Toggle";
import Center from "../layout/Center";
import { clsx } from "clsx";

export interface FormField {
  name: string;
  label?: string;
  /** `"textarea"`, `"select"` and `"toggle"` render those components; anything else is passed as an `<input type>`. */
  type?: "textarea" | "select" | "toggle" | string;
  value?: unknown;
  default?: unknown;
  autoComplete?: string;
  className?: string;
  hidden?: boolean;
  placeholder?: string;
  /** Options for `type: "select"`. */
  options?: SelectOption[];
  /** Adds a search box to `type: "select"`. */
  searchable?: boolean;
  /** Resize behavior for `type: "textarea"`. */
  resize?: TextareaProps["resize"];
  props?: Record<string, unknown>;
}

export interface FormProps {
  fields: FormField[];
  btn: ReactNode;
  onSubmit: (values: Record<string, unknown>) => void;
  className?: string;
  id?: string;
}

export default function Form({ fields, btn, onSubmit, className, id }: FormProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: field.value ?? field.default ?? (field.type === "toggle" ? false : ""),
      }),
      {},
    ),
  );
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});

  const setFieldValue = (name: string, value: unknown) => {
    setDirtyFields((prev) => ({ ...prev, [name]: true }));
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFieldValue(e.target.name, e.target.value);
  };

  const getFieldValue = (field: FormField): unknown => {
    if (dirtyFields[field.name]) {
      return values[field.name] ?? (field.type === "toggle" ? false : "");
    }

    return field.value ?? field.default ?? (field.type === "toggle" ? false : "");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submittedValues = fields.reduce(
      (acc, field) => ({ ...acc, [field.name]: getFieldValue(field) }),
      {} as Record<string, unknown>,
    );

    onSubmit(submittedValues);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx("flex flex-col gap-3 w-full max-w-md", className)}
      id={id || undefined}
    >
      {fields.map((field) => {
        const fieldClassName = clsx(field.className || "w-full", field.hidden && "hidden");

        if (field.type === "textarea") {
          return (
            <Textarea
              key={field.name}
              id={field.name}
              label={field.label || null}
              name={field.name}
              value={getFieldValue(field) as string}
              onChange={handleInputChange}
              resize={field.resize}
              className={fieldClassName}
              placeholder={field.placeholder}
              {...field.props}
            />
          );
        }

        if (field.type === "select") {
          return (
            <Select
              key={field.name}
              id={field.name}
              label={field.label || null}
              options={field.options ?? []}
              value={getFieldValue(field)}
              onChange={(v) => setFieldValue(field.name, v)}
              placeholder={field.placeholder}
              searchable={field.searchable}
              className={fieldClassName}
              {...field.props}
            />
          );
        }

        if (field.type === "toggle") {
          return (
            <Toggle
              key={field.name}
              checked={Boolean(getFieldValue(field))}
              onChange={(checked) => setFieldValue(field.name, checked)}
              label={field.label}
              {...field.props}
            />
          );
        }

        return (
          <Input
            autoComplete={field.autoComplete}
            key={field.name}
            id={field.name}
            label={field.label || null}
            name={field.name}
            type={field.type || "text"}
            value={getFieldValue(field) as string}
            onChange={handleInputChange}
            className={fieldClassName}
            {...(field.props as InputHTMLAttributes<HTMLInputElement>)}
          >
            {field.placeholder || field.name || ""}
          </Input>
        );
      })}
      <Center>{btn}</Center>
    </form>
  );
}
