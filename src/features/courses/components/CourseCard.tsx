"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types";
import { SectionRow } from "./SectionRow";

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
  const includedCount = course.sections.filter((s) =>
    includedIds.has(s.id),
  ).length;
  const allOn = includedCount === course.sections.length;

  return (
    <li className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span
          className="size-3 rounded-full shrink-0"
          style={{ backgroundColor: course.color }}
        />
        <button
          className="flex-1 min-w-0 text-left"
          onClick={() => setOpen((o) => !o)}
        >
          <p className="text-sm font-medium truncate">{course.name}</p>
          <p className="text-xs text-muted-foreground">
            {includedCount}/{course.sections.length} sections · {course.units}{" "}
            unit{course.units !== 1 ? "s" : ""}
          </p>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onRemove}>
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Section list */}
      {open && (
        <div className="border-t border-border">
          {/* Select all / none */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-muted/30">
            <span className="text-xs text-muted-foreground">Sections</span>
            <Button
              variant="link"
              size="xs"
              onClick={() => onToggleAll(!allOn)}
            >
              {allOn ? "Deselect all" : "Select all"}
            </Button>
          </div>
          {course.sections.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No sections found for this term.
            </p>
          ) : (
            course.sections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                included={includedIds.has(section.id)}
                onToggle={() => onToggleSection(section.id)}
                color={course.color}
              />
            ))
          )}
        </div>
      )}
    </li>
  );
}
