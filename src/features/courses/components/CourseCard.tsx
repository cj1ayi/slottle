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
    <li
      className="overflow-hidden border border-border bg-card"
      style={{ borderLeftWidth: 3, borderLeftColor: course.color }}
    >
      {/* ── Header — single compact row ──────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2.5 min-w-0">
        {/* Titles: code on top, name truncated below */}
        <button
          className="flex-1 min-w-0 text-left overflow-hidden"
          onClick={() => setOpen((o) => !o)}
        >
          <p className="text-xs font-bold text-foreground truncate leading-snug">
            {course.code}
          </p>
          <p className="text-[10px] text-muted-foreground truncate mt-px">
            {course.name}
          </p>
        </button>

        {/* Count badge */}
        <span className="text-[10px] font-semibold text-muted-foreground shrink-0 tabular-nums">
          {includedCount}/{course.sections.length}
        </span>

        {/* Expand */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>

        {/* Remove */}
        <button
          onClick={onRemove}
          className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* ── Section table ─────────────────────────────────────────── */}
      {open && (
        <div className="border-t border-border/50 overflow-x-auto">
          {course.sections.length === 0 ? (
            <p className="px-3 py-3 text-xs text-muted-foreground text-center">
              No sections for this term.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40">
                  <th className="pl-3 pr-2 py-1.5 text-left text-[10px] font-bold tracking-wide uppercase text-muted-foreground">
                    Section
                  </th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-bold tracking-wide uppercase text-muted-foreground">
                    Professor
                  </th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-bold tracking-wide uppercase text-muted-foreground">
                    Schedule
                  </th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-bold tracking-wide uppercase text-muted-foreground">
                    Room
                  </th>
                  <th className="px-2 py-1.5 text-left text-[10px] font-bold tracking-wide uppercase text-muted-foreground">
                    Days
                  </th>
                  <th className="pr-3 pl-2 py-1.5 text-right text-[10px] font-bold tracking-wide uppercase text-muted-foreground">
                    <button
                      onClick={() => onToggleAll(!allOn)}
                      className="font-semibold text-primary hover:opacity-70 transition-opacity normal-case tracking-normal"
                    >
                      {allOn ? "Deselect all" : "Select all"}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {course.sections.map((section) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    included={includedIds.has(section.id)}
                    onToggle={() => onToggleSection(section.id)}
                    color={course.color}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </li>
  );
}
