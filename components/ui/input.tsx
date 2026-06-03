"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Visually hide the label but keep it for screen readers. */
  hideLabel?: boolean;
}

const inputBase =
  "w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-body text-base rounded-[2px] px-4 py-4 placeholder:text-[var(--color-text-tertiary)] transition-colors duration-200 focus:border-[var(--color-accent)] focus:outline-none aria-[invalid=true]:border-[var(--color-danger)]";

function Label({
  htmlFor,
  children,
  required,
  hideLabel,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  hideLabel?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]",
        hideLabel && "sr-only"
      )}
    >
      {children}
      {required && <span aria-hidden="true"> *</span>}
    </label>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p
      id={id}
      className="mt-2 font-body text-sm text-[var(--color-danger)]"
      role="alert"
    >
      {error}
    </p>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  FieldProps & React.InputHTMLAttributes<HTMLInputElement>
>(function Input(
  { label, hint, error, required, hideLabel, className, id, ...props },
  ref
) {
  const generated = useId();
  const inputId = id ?? generated;
  const errorId = `${inputId}-error`;
  return (
    <div>
      <Label htmlFor={inputId} required={required} hideLabel={hideLabel}>
        {label}
      </Label>
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(inputBase, "min-h-[56px]", className)}
        {...props}
      />
      {hint && !error && (
        <p className="mt-2 font-mono text-xs text-[var(--color-text-tertiary)]">
          {hint}
        </p>
      )}
      <ErrorText id={errorId} error={error} />
    </div>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea(
  { label, hint, error, required, hideLabel, className, id, ...props },
  ref
) {
  const generated = useId();
  const inputId = id ?? generated;
  const errorId = `${inputId}-error`;
  return (
    <div>
      <Label htmlFor={inputId} required={required} hideLabel={hideLabel}>
        {label}
      </Label>
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(inputBase, "min-h-[120px] resize-y", className)}
        {...props}
      />
      {hint && !error && (
        <p className="mt-2 font-mono text-xs text-[var(--color-text-tertiary)]">
          {hint}
        </p>
      )}
      <ErrorText id={errorId} error={error} />
    </div>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  FieldProps & React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select(
  { label, hint, error, required, hideLabel, className, id, children, ...props },
  ref
) {
  const generated = useId();
  const inputId = id ?? generated;
  const errorId = `${inputId}-error`;
  return (
    <div>
      <Label htmlFor={inputId} required={required} hideLabel={hideLabel}>
        {label}
      </Label>
      <select
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(inputBase, "min-h-[56px] appearance-none", className)}
        {...props}
      >
        {children}
      </select>
      {hint && !error && (
        <p className="mt-2 font-mono text-xs text-[var(--color-text-tertiary)]">
          {hint}
        </p>
      )}
      <ErrorText id={errorId} error={error} />
    </div>
  );
});
