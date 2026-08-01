import { useState, ChangeEvent, FormEvent, ReactNode, InputHTMLAttributes } from "react";
import Button from "./Button";
import Input from "./Input";
import Center from "../layout/Center";
import { clsx } from "clsx";

export interface FormField {
  name: string;
  label?: string;
  type?: string;
  value?: string;
  default?: string;
  autoComplete?: string;
  className?: string;
  hidden?: boolean;
  placeholder?: string;
  props?: InputHTMLAttributes<HTMLInputElement>;
}

export interface FormProps {
  fields: FormField[];
  btn: ReactNode;
  onSubmit: (values: Record<string, string>) => void;
  className?: string;
  id?: string;
}

export default function Form({ fields, btn, onSubmit, className, id }: FormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: field.value ?? field.default ?? "",
      }),
      {},
    ),
  );
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDirtyFields((prev) => ({ ...prev, [name]: true }));
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const getFieldValue = (field: FormField) => {
    if (dirtyFields[field.name]) {
      return values[field.name] ?? "";
    }

    return field.value ?? field.default ?? "";
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const submittedValues = fields.reduce(
      (acc, field) => ({ ...acc, [field.name]: getFieldValue(field) }),
      {} as Record<string, string>,
    );

    onSubmit(submittedValues);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx("flex flex-col gap-2", className)}
      id={id || undefined}
    >
      {fields.map((field) => (
        <Input
          autoComplete={field.autoComplete}
          key={field.name}
          id={field.name}
          label={field.label || null}
          name={field.name}
          type={field.type || "text"}
          value={getFieldValue(field)}
          onChange={handleChange}
          className={clsx(field.className, field.hidden && "hidden")}
          {...field.props}
        >
          {field.placeholder || field.name || ""}
        </Input>
      ))}
      <Center>{btn}</Center>
    </form>
  );
}
