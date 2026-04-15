"use client";

import { Check } from "lucide-react";
import { meetingSummary } from "@/lib/utils";
import type { Section } from "@/types";
import { cn } from "@/lib/utils";
import { isPECourse, getPESport } from "@/data/peSections";

type Props = {
  section: Section;
  included: boolean;
  onToggle: () => void;
  color: string;
};

export function SectionRow({ section, included, onToggle, color }: Props) {
  const slots = section.capacity - section.enlisted;
  const full = slots <= 0;
  const pct = section.capacity > 0
    ? Math.round((section.enlisted / section.capacity) * 100)
    : 0;
  const sport = isPECourse(section.code) ? getPESport(section.code, section.section) : undefined;

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors border-t border-border/30",
        "hover:bg-accent/50",
        !included && "opacity-45",
      )}
    >
      {/* Checkbox — slightly larger than default, clearly readable */}
      <span
        className={cn(
          "size-5 rounded flex items-center justify-center shrink-0 transition-all border-2",
          included
            ? "border-transparent"
            : "border-muted-foreground/40 bg-background dark:bg-input",
        )}
        style={included ? { backgroundColor: color, borderColor: color } : {}}
      >
        {included && <Check className="size-3 text-white stroke-[3]" />}
      </span>

      {/* Main info block */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Row 1: section code + professor */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-foreground shrink-0">
            {section.section}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {section.professor || "TBA"}
          </span>
        </div>
        {/* Sport badge — only shown for PE courses */}
        {sport && (
          <p className="text-[10px] font-semibold text-foreground/80 leading-tight truncate">
            {sport}
          </p>
        )}
        {/* Row 2: schedule */}
        <p className="text-[10px] text-muted-foreground/70 leading-tight font-mono truncate">
          {meetingSummary(section.meetings)}
        </p>
      </div>

      {/* Capacity pill — right aligned, compact */}
      <span
        className={cn(
          "shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded",
          full
            ? "bg-destructive/15 text-destructive dark:bg-destructive/20"
            : pct >= 80
              ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
              : "bg-[var(--tertiary-bg)] text-[var(--tertiary)]",
        )}
      >
        {full ? "Full" : `${slots}`}
      </span>
    </button>
  );
}
