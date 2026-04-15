"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Moon, Settings, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TutorialModal } from "./TutorialModal";

export function Navbar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  // Sync with saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("slottle-theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("slottle-theme", next ? "dark" : "light");
  }

  return (
    <header className="h-[52px] flex items-center px-6 shrink-0 z-20 bg-background border-b border-border">
      {/* Logo */}
      <span
        className="font-[family-name:var(--font-outfit)] text-base font-black tracking-tight text-foreground select-none"
        style={{ letterSpacing: "-0.02em" }}
      >
        SLOTTLE
      </span>

      {/* Nav links */}
      <nav className="flex items-center gap-7 ml-8">
        <NavLink href="/" active={pathname === "/"}>
          Main
        </NavLink>
        <NavLink href="/saved" active={pathname === "/saved"}>
          Saved Schedules
        </NavLink>
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1">
        <TutorialModal>
          <IconBtn label="How to get your cookie">
            <HelpCircle className="size-4" />
          </IconBtn>
        </TutorialModal>
        <IconBtn label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleTheme}>
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </IconBtn>
        <IconBtn label="Settings">
          <Settings className="size-4" />
        </IconBtn>
        <IconBtn label="Account">
          <User className="size-4" />
        </IconBtn>
      </div>
    </header>
  );
}

function NavLink({
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
        "relative text-sm font-medium transition-colors pb-px",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 -bottom-[18px] h-[2px] bg-primary rounded-full" />
      )}
    </Link>
  );
}

function IconBtn({
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
      className="size-8 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {children}
    </button>
  );
}
