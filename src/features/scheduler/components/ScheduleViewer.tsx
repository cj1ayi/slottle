"use client";

import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  Zap,
} from "lucide-react";
import { ScheduleGrid } from "@/features/calendar/components/ScheduleGrid";
import type { Course, Schedule } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  schedules: Schedule[];
  activeIndex: number;
  generating: boolean;
  generateError: string;
  truncated: boolean;
  canGenerate: boolean;
  selectedCourses: Course[];
  onGenerate: () => void;
  onSave: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function ScheduleViewer({
  schedules,
  activeIndex,
  generating,
  generateError,
  truncated,
  canGenerate,
  selectedCourses,
  onGenerate,
  onSave,
  onPrev,
  onNext,
}: Props) {
  const hasSchedules = schedules.length > 0;
  const active = schedules[activeIndex];

  /* ── Compute stats ──────────────────────────────────────────── */
  const totalHours = active
    ? (() => {
        let mins = 0;
        for (const s of active.sections) {
          for (const m of s.meetings) {
            const startH = Math.floor(m.start / 100) * 60 + (m.start % 100);
            const endH = Math.floor(m.end / 100) * 60 + (m.end % 100);
            mins += endH - startH;
          }
        }
        return (mins / 60).toFixed(1);
      })()
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* ── Top toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border/40 shrink-0">
        {/* Filters row */}
        <div className="flex items-center gap-3 flex-1">
          <FilterChip label="Start Time" value="Earliest Start" />
          <FilterChip label="End Time" value="Latest End" />
          <FilterChip label="Avoid Prof" placeholder="Name..." />
          <FilterChip label="Max Consec" value="3" />
        </div>

        {/* Schedule nav + Generate */}
        <div className="flex items-center gap-2 shrink-0">
          {hasSchedules && (
            <>
              <button
                onClick={onPrev}
                disabled={activeIndex === 0}
                className="size-7 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-xs font-mono text-muted-foreground tabular-nums min-w-[7rem] text-center">
                Schedule {activeIndex + 1} of {schedules.length}
              </span>
              <button
                onClick={onNext}
                disabled={activeIndex === schedules.length - 1}
                className="size-7 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
              <button
                onClick={onSave}
                className="h-7 px-3 flex items-center gap-1.5 text-xs font-semibold border border-border/60 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Download className="size-3.5" />
                Export
              </button>
            </>
          )}

          {/* Generate button */}
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className={cn(
              "h-8 px-4 flex items-center gap-2 text-xs font-bold tracking-widest uppercase rounded-sm transition-opacity",
              canGenerate
                ? "btn-primary-gradient text-primary-foreground hover:opacity-90"
                : "bg-accent text-muted-foreground cursor-not-allowed",
            )}
          >
            {generating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Zap className="size-3.5" />
            )}
            Generate
          </button>
        </div>
      </div>

      {/* ── Error banner ────────────────────────────────────────── */}
      {generateError && (
        <div className="mx-6 mt-4 flex items-start gap-2 rounded-sm border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive shrink-0">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p>{generateError}</p>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────── */}
      {!hasSchedules ? (
        <EmptySchedule
          selectedCourses={selectedCourses}
          canGenerate={canGenerate}
          generating={generating}
          truncated={truncated}
          scheduleCount={schedules.length}
          onGenerate={onGenerate}
        />
      ) : (
        <>
          {/* Grid area */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {truncated && (
              <p className="text-xs text-muted-foreground mb-3">
                Showing first {schedules.length.toLocaleString()} combinations
                (cap reached).
              </p>
            )}
            <div className="rounded-sm overflow-hidden bg-card">
              <ScheduleGrid schedule={active} courses={selectedCourses} />
            </div>
          </div>

          {/* ── Bottom stats bar ──────────────────────────────────── */}
          <div className="shrink-0 border-t border-border/40 grid grid-cols-3 divide-x divide-border/40">
            <StatCell
              icon={<Clock className="size-4 text-primary" />}
              label="Load"
              value={`${totalHours} Hours`}
            />
            <StatCell
              icon={
                <span className="size-4 flex items-center justify-center text-[oklch(0.75_0.14_185)]">
                  ◎
                </span>
              }
              label="Gap Score"
              value="Optimal (0.8)"
              valueClass="text-[oklch(0.75_0.14_185)]"
            />
            <StatCell
              icon={<AlertTriangle className="size-4 text-primary" />}
              label="Conflicts"
              value="Zero Detected"
            />
          </div>
        </>
      )}
    </div>
  );
}

/* ── Filter chip ─────────────────────────────────────────────────── */
function FilterChip({
  label,
  value,
  placeholder,
}: {
  label: string;
  value?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
        {label}
      </span>
      {placeholder ? (
        <input
          type="text"
          placeholder={placeholder}
          className="h-7 w-24 px-2 text-xs bg-input rounded-sm border border-border/40 text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
        />
      ) : (
        <button className="h-7 px-2 flex items-center gap-1 text-xs bg-input rounded-sm border border-border/40 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
          {value}
          <ChevronDown className="size-3" />
        </button>
      )}
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Stat cell ───────────────────────────────────────────────────── */
function StatCell({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-4">
      {icon}
      <div>
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
          {label}
        </p>
        <p className={cn("text-base font-bold tracking-tight", valueClass)}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── Empty schedule state ────────────────────────────────────────── */
function EmptySchedule({
  selectedCourses,
  canGenerate,
  generating,
  truncated,
  scheduleCount,
  onGenerate,
}: {
  selectedCourses: Course[];
  canGenerate: boolean;
  generating: boolean;
  truncated: boolean;
  scheduleCount: number;
  onGenerate: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
      <p
        className="font-[family-name:var(--font-outfit)] font-black text-[clamp(2rem,6vw,4rem)] leading-none tracking-tight text-muted-foreground/10 mb-6"
        style={{ letterSpacing: "-0.03em" }}
      >
        GENERATE
      </p>
      {selectedCourses.length === 0 ? (
        <p className="text-sm text-muted-foreground max-w-xs">
          Add courses from the sidebar to start building your schedule.
        </p>
      ) : !canGenerate ? (
        <p className="text-sm text-muted-foreground max-w-xs">
          Select at least one section per course, then hit Generate.
        </p>
      ) : generating ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Computing conflict-free combinations…
        </div>
      ) : scheduleCount === 0 && !generating ? (
        <p className="text-sm text-muted-foreground max-w-xs">
          No conflict-free combinations found with the selected sections.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground max-w-xs">
          Ready to generate. Hit the Generate button above.
        </p>
      )}
    </div>
  );
}
