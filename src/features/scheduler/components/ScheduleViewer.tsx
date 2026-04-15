"use client";

import {
  AlertCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { ScheduleGrid } from "@/features/calendar/components/ScheduleGrid";
import { meetingSummary } from "@/lib/utils";
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
  onSave,
  onPrev,
  onNext,
}: Props) {
  const hasSchedules = schedules.length > 0;
  const active = schedules[activeIndex];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Schedule nav bar ──────────────────────────────────────── */}
      {hasSchedules && (
        <div className="shrink-0 flex items-center gap-3 px-5 py-3 border-b border-border bg-background/60 backdrop-blur-sm">
          {/* Prev / counter / next */}
          <button
            onClick={onPrev}
            disabled={activeIndex === 0}
            className="size-8 flex items-center justify-center rounded hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>

          <span className="text-sm font-medium text-foreground tabular-nums min-w-[8rem] text-center">
            Schedule{" "}
            <span className="text-primary font-bold">{activeIndex + 1}</span>
            {" "}of{" "}
            <span className="font-bold">{schedules.length}</span>
          </span>

          <button
            onClick={onNext}
            disabled={activeIndex === schedules.length - 1}
            className="size-8 flex items-center justify-center rounded hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Truncation notice */}
          {truncated && (
            <span className="text-xs text-muted-foreground ml-1">
              (cap reached — showing first {schedules.length.toLocaleString()})
            </span>
          )}

          {/* Save */}
          <button
            onClick={onSave}
            className="ml-auto flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <Bookmark className="size-3.5" />
            Save
          </button>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────── */}
      {generateError && (
        <div className="shrink-0 mx-5 mt-4 flex items-start gap-2 rounded border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p>{generateError}</p>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────── */}
      {!hasSchedules ? (
        <EmptyState selectedCourses={selectedCourses} generating={generating} />
      ) : (
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* Grid */}
          <div className="rounded-lg overflow-hidden border border-border bg-card">
            <ScheduleGrid schedule={active} courses={selectedCourses} />
          </div>

          {/* Section legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {active.sections.map((s) => {
              const course = selectedCourses.find((c) => c.code === s.code);
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <span
                    className="size-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: course?.color }}
                  />
                  <span className="font-semibold text-foreground">
                    {s.code} {s.section}
                  </span>
                  <span>— {s.professor || "TBA"} · {meetingSummary(s.meetings)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────────── */
function EmptyState({
  selectedCourses,
  generating,
}: {
  selectedCourses: Course[];
  generating: boolean;
}) {
  const message =
    generating
      ? "Computing conflict-free combinations…"
      : selectedCourses.length === 0
        ? "Add courses from the sidebar to start building your schedule."
        : "Select at least one section per course, then hit Generate.";

  return (
    <div className="flex-1 flex flex-col items-center justify-center select-none pointer-events-none px-8 py-16">
      {/* Big faded word mark */}
      <p
        className="font-[family-name:var(--font-outfit)] font-black leading-none text-foreground/[0.04] dark:text-foreground/[0.04]"
        style={{
          fontSize: "clamp(4rem, 14vw, 10rem)",
          letterSpacing: "-0.04em",
        }}
      >
        GENERATE
      </p>

      {/* Subtext */}
      <div className="mt-6 flex items-center gap-2 pointer-events-auto">
        {generating && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {message}
        </p>
      </div>
    </div>
  );
}
