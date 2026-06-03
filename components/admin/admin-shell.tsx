"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/participants", label: "Participants" },
  { href: "/admin/vetting", label: "Vetting" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/press", label: "Press" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="container-editorial flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-base text-[var(--color-text-primary)]">
              M.D. <span className="text-[var(--color-text-tertiary)]">admin</span>
            </Link>
            <nav className="hidden items-center gap-6 sm:flex">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "font-mono text-xs uppercase tracking-[0.1em] transition-colors",
                    pathname === l.href
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] sm:inline">
              {email}
            </span>
            <button
              onClick={signOut}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Sign out
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex items-center gap-6 overflow-x-auto border-t border-[var(--color-border)] px-5 py-3 sm:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "whitespace-nowrap font-mono text-xs uppercase tracking-[0.1em]",
                pathname === l.href
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-tertiary)]"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container-editorial py-12">{children}</main>
    </div>
  );
}
