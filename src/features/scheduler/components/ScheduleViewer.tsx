"use client";

import { Bookmark, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleGrid } from "@/features/calendar/components/ScheduleGrid";
import { meetingSummary } from "@/lib/utils";
import type { Course, Schedule } from "@/types";

type Props = {
  schedules: Schedule[];
  activeIndex: number;
  generating: boolean;
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
  canGenerate,
  selectedCourses,
  onGenerate,
  onSave,
  onPrev,
  onNext,
}: Props) {
  return (
    <>
      {/* Generate */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          className="h-10 px-6"
        >
          {generating && <Loader2 className="size-4 animate-spin" />}
          Generate schedules
        </Button>
        {schedules.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {schedules.length} valid combination
            {schedules.length !== 1 ? "s" : ""} found
          </p>
        )}
        {!generating &&
          schedules.length === 0 &&
          selectedCourses.length > 0 &&
          canGenerate && (
            <p className="text-sm text-muted-foreground">
              No conflict-free combinations with selected sections.
            </p>
          )}
      </div>

      {/* Schedule viewer */}
      {schedules.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">Schedule</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onPrev}
                disabled={activeIndex === 0}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm tabular-nums min-w-[5rem] text-center text-muted-foreground">
                {activeIndex + 1} / {schedules.length}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onNext}
                disabled={activeIndex === schedules.length - 1}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              className="ml-auto gap-1.5"
            >
              <Bookmark className="size-3.5" /> Save
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <ScheduleGrid
              schedule={schedules[activeIndex]}
              courses={selectedCourses}
            />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {schedules[activeIndex].sections.map((s) => {
              const course = selectedCourses.find((c) => c.code === s.code);
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className="size-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: course?.color }}
                  />
                  <span className="font-medium text-foreground">
                    {s.code} {s.section}
                  </span>
                  <span>
                    — {s.professor || "TBA"} · {meetingSummary(s.meetings)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
