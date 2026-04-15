"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  LayoutGrid,
  List,
  Download,
  Share2,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useStore } from "@/store";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { ScheduleGrid } from "@/features/calendar/components/ScheduleGrid";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

export default function SavedPage() {
  const [hydrated, setHydrated] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] shrink-0 flex flex-col overflow-hidden bg-sidebar">
        <div className="px-5 py-5 shrink-0">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
            Selection Engine
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Precision Course Engineering
          </p>
        </div>

        <nav className="px-3 space-y-0.5 py-2 flex-1">
          <SidebarItem icon={<Search className="size-4" />} label="Course Search" />
          <SidebarItem icon={<Filter className="size-4" />} label="Filters" />
          <SidebarItem icon={<AlertTriangle className="size-4" />} label="Conflicts" />
        </nav>

        <div className="shrink-0 px-5 py-4 border-t border-border/40">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
            Engine Status
          </p>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full shrink-0 bg-destructive" />
            <span className="text-xs text-muted-foreground">
              Waiting for connection...
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">
            Saved Schedules
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Access and manage your engineered course combinations.
            High-density previews for rapid comparison.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-sm bg-input rounded-sm border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Sort */}
          <button className="h-8 flex items-center gap-1.5 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/60 rounded-sm transition-colors bg-input">
            <SlidersHorizontal className="size-3" />
            Date Modified
            <ChevronDown className="size-3" />
          </button>

          {/* View toggle */}
          <div className="flex items-center border border-border/60 rounded-sm overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-8 w-8 flex items-center justify-center transition-colors",
                viewMode === "grid"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "h-8 w-8 flex items-center justify-center transition-colors",
                viewMode === "list"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Grid / Empty */}
        {filtered.length === 0 ? (
          <EmptyState hasSearch={search.length > 0} />
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-3",
            )}
          >
            {filtered.map((entry) => (
              <SavedCard
                key={entry.id}
                entry={entry}
                viewMode={viewMode}
                onRename={(name) => saved.renameSaved(entry.id, name)}
                onRemove={() => saved.removeSaved(entry.id)}
              />
            ))}

            {/* Generate new card */}
            <GenerateNewCard />
          </div>
        )}

        {/* Bulk Export Engine */}
        {saved.saved.length > 0 && (
          <div className="mt-8 rounded-sm bg-card border border-border/40 p-5">
            <h2 className="text-sm font-semibold mb-1">Bulk Export Engine</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Select multiple schedules to export as a high-resolution PDF
              package or individual high-fidelity PNG images for your calendar.
            </p>
            <div className="flex items-center gap-3">
              <button className="h-8 px-4 text-xs font-semibold tracking-wide bg-primary text-primary-foreground rounded-sm btn-primary-gradient transition-opacity hover:opacity-90">
                Export Selected
              </button>
              <button className="h-8 px-4 text-xs font-semibold tracking-wide border border-border/60 text-muted-foreground hover:text-foreground rounded-sm transition-colors">
                Download All (CSV)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Saved card ──────────────────────────────────────────────────── */
function SavedCard({
  entry,
  viewMode,
  onRename,
  onRemove,
}: {
  entry: ReturnType<typeof useSaved>["saved"][number];
  viewMode: "grid" | "list";
  onRename: (name: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.name);

  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });

  const time = new Date(entry.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasConflict = false; // future: detect conflicts
  const totalCredits = entry.courses.reduce((sum, c) => sum + c.units, 0);

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== entry.name) onRename(trimmed);
    else setDraft(entry.name);
    setEditing(false);
  }

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 p-3 rounded-sm bg-card border border-border/40 hover:border-border/70 transition-colors group">
        {/* Mini grid preview */}
        <div className="w-32 h-20 overflow-hidden rounded-sm bg-background shrink-0 opacity-80">
          <div className="scale-[0.35] origin-top-left w-[228%] h-[286%] pointer-events-none">
            <ScheduleGrid
              schedule={entry.schedule}
              courses={entry.courses as Course[]}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              className="text-sm font-medium bg-transparent border-b border-primary outline-none w-full"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") { setDraft(entry.name); setEditing(false); }
              }}
            />
          ) : (
            <button className="text-sm font-medium text-left truncate block w-full" onClick={() => setEditing(true)}>
              {entry.name}
            </button>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalCredits} Credits · {entry.courses.length} Courses
          </p>
        </div>

        <span className="text-xs text-muted-foreground shrink-0">{date}</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionBtn onClick={() => {}} label="Share"><Share2 className="size-3.5" /></ActionBtn>
          <ActionBtn onClick={onRemove} label="Delete"><Trash2 className="size-3.5" /></ActionBtn>
          <ActionBtn onClick={() => {}} label="Download"><Download className="size-3.5" /></ActionBtn>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm bg-card border border-border/40 hover:border-border/70 transition-colors overflow-hidden group relative">
      {/* Status badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
        {hasConflict ? (
          <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-sm bg-destructive/20 text-destructive">
            Has Conflicts
          </span>
        ) : (
          <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded-sm bg-[oklch(0.25_0.06_185)] text-[oklch(0.75_0.14_185)]">
            Optimized
          </span>
        )}
        <span className="text-[10px] text-muted-foreground font-mono">
          {totalCredits} CR · {entry.courses.length} CX
        </span>
      </div>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionBtn onClick={() => {}} label="Share"><Share2 className="size-3" /></ActionBtn>
        <ActionBtn onClick={onRemove} label="Delete"><Trash2 className="size-3" /></ActionBtn>
        <ActionBtn onClick={() => {}} label="Download"><Download className="size-3" /></ActionBtn>
      </div>

      {/* Grid preview */}
      <div className="h-40 overflow-hidden bg-background border-b border-border/40 relative">
        <div className="scale-[0.32] origin-top-left w-[312%] h-[312%] pointer-events-none opacity-90">
          <ScheduleGrid
            schedule={entry.schedule}
            courses={entry.courses as Course[]}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5">
        {editing ? (
          <input
            autoFocus
            className="text-sm font-medium bg-transparent border-b border-primary outline-none w-full"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") { setDraft(entry.name); setEditing(false); }
            }}
          />
        ) : (
          <button
            className="text-sm font-medium text-left truncate block w-full"
            onClick={() => setEditing(true)}
          >
            {entry.name}
          </button>
        )}
        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
          Saved on {date} · {time}
        </p>
      </div>
    </div>
  );
}

/* ── Generate new placeholder card ─────────────────────────────── */
function GenerateNewCard() {
  return (
    <a
      href="/"
      className="rounded-sm border border-dashed border-border/60 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 h-[200px] text-center group"
    >
      <div className="size-10 rounded-full border border-dashed border-border/60 group-hover:border-primary/50 flex items-center justify-center transition-colors">
        <span className="text-xl text-muted-foreground group-hover:text-primary transition-colors">+</span>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Generate New
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          Create a new schedule combination
          <br />
          from your course selection.
        </p>
      </div>
    </a>
  );
}

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-4xl font-black tracking-tight text-muted-foreground/20 font-[family-name:var(--font-outfit)] mb-3">
        {hasSearch ? "NO MATCH" : "EMPTY"}
      </p>
      <p className="text-sm text-muted-foreground">
        {hasSearch
          ? "No saved schedules match your search."
          : "No schedules saved yet. Generate one from the Main page."}
      </p>
    </div>
  );
}

/* ── Shared helpers ──────────────────────────────────────────────── */
function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors",
        active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ActionBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="size-6 flex items-center justify-center rounded-sm bg-accent/80 text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );
}
