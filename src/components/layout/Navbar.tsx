"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="h-[52px] flex items-center px-6 shrink-0 relative z-20 bg-background">
      {/* Logo */}
      <span
        className="font-[family-name:var(--font-outfit)] text-base font-black tracking-tight text-foreground"
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
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      className="size-8 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {children}
    </button>
  );
}
