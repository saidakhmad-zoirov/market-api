import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({ label, error, id, ...rest }: FieldProps) {
  const fieldId = id ?? rest.name;
  return (
    <label className="block space-y-2" htmlFor={fieldId}>
      <span className="label">{label}</span>
      <input id={fieldId} className="field" aria-invalid={error ? true : undefined} {...rest} />
      {error && <span className="block text-sm text-danger">{error}</span>}
    </label>
  );
}

interface AreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, id, ...rest }: AreaProps) {
  const fieldId = id ?? rest.name;
  return (
    <label className="block space-y-2" htmlFor={fieldId}>
      <span className="label">{label}</span>
      <textarea id={fieldId} className="field min-h-24 resize-y" aria-invalid={error ? true : undefined} {...rest} />
      {error && <span className="block text-sm text-danger">{error}</span>}
    </label>
  );
}
