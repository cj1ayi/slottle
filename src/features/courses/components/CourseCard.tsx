"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import type { Course } from "@/types";
import { SectionRow } from "./SectionRow";
import { cn } from "@/lib/utils";

type Props = {
  course: Course;
  includedIds: Set<string>;
  onRemove: () => void;
  onToggleSection: (sectionId: string) => void;
  onToggleAll: (include: boolean) => void;
};

export function CourseCard({
  course,
  includedIds,
  onRemove,
  onToggleSection,
  onToggleAll,
}: Props) {
  const [open, setOpen] = useState(true);
  const includedCount = course.sections.filter((s) => includedIds.has(s.id)).length;
  const allOn = includedCount === course.sections.length;

  return (
    <li className="rounded-sm overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Color dot */}
        <span
          className="size-2 rounded-full shrink-0"
          style={{ backgroundColor: course.color }}
        />

        {/* Course info */}
        <button
          className="flex-1 min-w-0 text-left"
          onClick={() => setOpen((o) => !o)}
        >
          <p className="text-xs font-bold tracking-wide text-foreground truncate">
            {course.code}
          </p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {course.name}
          </p>
        </button>

        {/* Section count + toggle */}
        <button
          className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-muted-foreground hover:text-foreground transition-colors shrink-0"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="uppercase">{course.sections.length} Sections</span>
          {/* Availability dot */}
          <span
            className={cn(
              "size-1.5 rounded-full ml-0.5",
              includedCount > 0 ? "bg-[oklch(0.75_0.14_185)]" : "bg-muted-foreground/40",
            )}
          />
        </button>

        {/* Chevron */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>

        {/* Remove */}
        <button
          onClick={onRemove}
          className="text-muted-foreground/60 hover:text-destructive transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Sections list */}
      {open && (
        <div className="border-t border-border/40">
          {/* Select all row */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-background/30">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Sections
            </span>
            <button
              onClick={() => onToggleAll(!allOn)}
              className="text-[10px] font-semibold text-primary hover:opacity-70 transition-opacity"
            >
              {allOn ? "Deselect all" : "Select all"}
            </button>
          </div>

          {course.sections.length === 0 ? (
            <p className="px-3 py-3 text-xs text-muted-foreground">
              No sections found for this term.
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {course.sections.map((section) => (
                <SectionRow
                  key={section.id}
                  section={section}
                  included={includedIds.has(section.id)}
                  onToggle={() => onToggleSection(section.id)}
                  color={course.color}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
