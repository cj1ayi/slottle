"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Pencil, Search, Trash2, Loader2, LayoutGrid, Calendar } from "lucide-react";
import { useStore } from "@/store";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { ScheduleGrid } from "@/features/calendar/components/ScheduleGrid";
import { meetingSummary } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { NavLogo, NavLink, NavBadge, NavRightIcons } from "@/components/layout/NavPrimitives";
import type { Course, UserSchedule } from "@/types";

export default function SavedPage() {
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const saved = useSaved();

  useEffect(() => {
    const result = useStore.persist.rehydrate();
    Promise.resolve(result).then(() => setHydrated(true));
  }, []);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filtered = search.trim()
    ? saved.saved.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.courses.some((c) =>
            c.code.toLowerCase().includes(search.toLowerCase()),
          ),
      )
    : saved.saved;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="h-[52px] flex items-center gap-6 px-6 border-b border-border shrink-0 bg-background">
        <NavLogo />
        <span className="h-5 w-px bg-border" />
        <nav className="flex items-center gap-5">
          <NavLink href="/" active={false}>
            <LayoutGrid className="size-3.5" /> Courses
          </NavLink>
          <NavLink href="/" active={false}>
            <Calendar className="size-3.5" /> Schedules
          </NavLink>
          <NavLink href="/saved" active={true}>
            Saved
            {saved.saved.length > 0 && <NavBadge count={saved.saved.length} muted />}
          </NavLink>
        </nav>
        <div className="ml-auto">
          <NavRightIcons />
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Page header */}
        <div className="px-6 pt-6 pb-4 border-b border-border flex items-end gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">Saved Schedules</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage and export your engineered course combinations.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search schedules…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm bg-input rounded border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <EmptyState hasSearch={search.length > 0} />
        ) : (
          <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filtered.map((entry) => (
              <SavedCard
                key={entry.id}
                entry={entry}
                onRename={(name) => saved.renameSaved(entry.id, name)}
                onRemove={() => saved.removeSaved(entry.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Saved card ──────────────────────────────────────────────────── */
function SavedCard({
  entry,
  onRename,
  onRemove,
}: {
  entry: UserSchedule;
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const time = new Date(entry.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  function startEdit() {
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== entry.name) onRename(trimmed);
    else setDraft(entry.name);
    setEditing(false);
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* ── Card header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        {editing ? (
          <input
            ref={inputRef}
            autoFocus
            className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-b-2 border-primary outline-none text-foreground pb-0.5"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setDraft(entry.name);
                setEditing(false);
              }
            }}
          />
        ) : (
          <button
            onClick={startEdit}
            className="flex-1 min-w-0 text-left group flex items-center gap-1.5"
          >
            <span className="text-sm font-semibold text-foreground truncate">
              {entry.name}
            </span>
            <Pencil className="size-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
          </button>
        )}

        <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">
          {date} · {time}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <ActionBtn label="Download" onClick={() => {}}>
            <Download className="size-3.5" />
          </ActionBtn>
          <ActionBtn label="Delete" onClick={onRemove} destructive>
            <Trash2 className="size-3.5" />
          </ActionBtn>
        </div>
      </div>

      {/* ── Grid preview ─────────────────────────────────────────── */}
      <div className="border-b border-border/50 bg-background overflow-hidden" style={{ height: 180 }}>
        <div
          className="pointer-events-none"
          style={{
            transform: "scale(0.38)",
            transformOrigin: "top left",
            width: "263%",
            height: "263%",
          }}
        >
          <ScheduleGrid
            schedule={entry.schedule}
            courses={entry.courses as Course[]}
          />
        </div>
      </div>

      {/* ── Section breakdown ─────────────────────────────────────── */}
      <div className="px-4 py-3 space-y-1.5">
        {entry.schedule.sections.map((s) => {
          const course = entry.courses.find((c) => c.code === s.code);
          return (
            <div key={s.id} className="flex items-start gap-2 text-xs">
              <span
                className="mt-1 size-2 rounded-full shrink-0"
                style={{ backgroundColor: course?.color ?? "#6B7280" }}
              />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground">
                  {s.code}
                </span>
                <span className="text-muted-foreground">
                  {" "}— {s.section} · {s.professor || "TBA"}
                </span>
                <p className="text-muted-foreground/70 mt-0.5 text-[10px] font-mono">
                  {meetingSummary(s.meetings)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-8 select-none">
      <p
        className="font-[family-name:var(--font-outfit)] font-black leading-none text-foreground/[0.04]"
        style={{ fontSize: "clamp(3rem, 10vw, 7rem)", letterSpacing: "-0.04em" }}
      >
        {hasSearch ? "NO MATCH" : "EMPTY"}
      </p>
      <p className="mt-5 text-sm text-muted-foreground max-w-xs">
        {hasSearch
          ? "No schedules match your search."
          : "Save a schedule from the Main page to see it here."}
      </p>
    </div>
  );
}

/* ── Action button ───────────────────────────────────────────────── */
function ActionBtn({
  label,
  onClick,
  destructive = false,
  children,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "size-7 flex items-center justify-center rounded transition-colors",
        destructive
          ? "text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
          : "text-muted-foreground/50 hover:text-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}
