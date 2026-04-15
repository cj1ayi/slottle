"use client";

import { Check } from "lucide-react";
import { meetingSummary } from "@/lib/utils";
import type { Section } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  section: Section;
  included: boolean;
  onToggle: () => void;
  color: string;
};

export function SectionRow({ section, included, onToggle, color }: Props) {
  const slots = section.capacity - section.enlisted;
  const full = slots <= 0;

  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-accent/60",
        !included && "opacity-40",
      )}
    >
      {/* Checkbox */}
      <span
        className={cn(
          "mt-0.5 size-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
          included ? "border-transparent" : "border-border bg-input",
        )}
        style={included ? { backgroundColor: color } : {}}
      >
        {included && <Check className="size-2 text-white" />}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-foreground">
            {section.section}
          </span>
          <span className="text-[10px] text-muted-foreground truncate">
            {section.professor || "TBA"}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
          {meetingSummary(section.meetings)}
        </p>
      </div>

      {/* Slots chip */}
      <span
        className={cn(
          "text-[10px] shrink-0 mt-0.5 font-semibold px-1.5 py-0.5 rounded-sm",
          full
            ? "bg-destructive/15 text-destructive"
            : "bg-[oklch(0.25_0.06_185)] text-[oklch(0.75_0.14_185)]",
        )}
      >
        {full ? "FULL" : `${slots}`}
      </span>
    </button>
  );
}
