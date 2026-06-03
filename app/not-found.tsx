import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-[28vw] font-light leading-none text-[var(--color-text-primary)] sm:text-[12rem]">
        404
      </p>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
        This does not exist
      </p>
      <p className="mt-6 max-w-sm font-body text-base text-[var(--color-text-secondary)]">
        The page you were looking for was never declared.
      </p>
      <Link
        href="/"
        className="mt-10 border-b border-[var(--color-border-strong)] pb-1 font-body text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
      >
        Back to the beginning →
      </Link>
    </main>
  );
}
