import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

const base =
  "inline-flex items-center justify-center font-body text-sm font-medium uppercase tracking-[0.1em] transition-colors duration-300 rounded-[2px] px-8 py-4 text-center";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-bg)] border border-[var(--color-text-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg)]",
  secondary:
    "bg-transparent border border-[var(--color-text-tertiary)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-primary)] hover:text-[var(--color-text-primary)]",
};

/** Anchor styled as a button. For navigation (vs Button for actions). */
export function LinkButton({
  href,
  variant = "primary",
  fullWidth,
  className,
  children,
  ...props
}: {
  href: string;
  variant?: Variant;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </Link>
  );
}

/** Discreet inline text link with the editorial underline treatment. */
export function InlineLink({
  href,
  className,
  children,
  external,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls = cn(
    "text-[var(--color-text-primary)] underline decoration-[0.5px] underline-offset-4 transition-colors duration-300 hover:text-[var(--color-accent-bright)]",
    className
  );
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
