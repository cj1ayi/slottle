"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ── Logo ─────────────────────────────────────────────────────────── */
export function NavLogo() {
  return (
    <span
      className="font-[family-name:var(--font-outfit)] text-base font-black tracking-tight text-foreground select-none"
      style={{ letterSpacing: "-0.02em" }}
    >
      slottle
    </span>
  );
}

/* ── Nav link (route-level, e.g. /saved) ─────────────────────────── */
export function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-1.5 px-1 py-3 text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary rounded-t-full" />
      )}
    </Link>
  );
}

/* ── Tab button (state-level, e.g. Courses / Schedules) ─────────── */
export function NavTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-1.5 px-1 py-3 text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary rounded-t-full" />
      )}
    </button>
  );
}

/* ── Count badge ─────────────────────────────────────────────────── */
export function NavBadge({ count, muted }: { count: number; muted?: boolean }) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums",
        muted
          ? "bg-muted text-muted-foreground"
          : "bg-primary/15 text-primary",
      )}
    >
      {count}
    </span>
  );
}

/* ── Icon button ─────────────────────────────────────────────────── */
export function NavIconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="size-8 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {children}
    </button>
  );
}

/* ── Theme toggle ─────────────────────────────────────────────────── */
export function ThemeToggle() {
  // Derive from DOM so we're always in sync with the flash-prevention script
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return document.documentElement.classList.contains("dark");
  });

  // Sync once on mount in case SSR guessed wrong
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("slottle-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <NavIconBtn label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggle}>
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </NavIconBtn>
  );
}

/* ── Right icon cluster ─────────────────────────────────────────── */
export function NavRightIcons() {
  return (
    <div className="flex items-center gap-0.5">
      <ThemeToggle />
    </div>
  );
}
