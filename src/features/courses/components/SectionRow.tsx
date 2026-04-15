"use client";

import { Check } from "lucide-react";
import { fmtTime, groupMeetings } from "@/lib/utils";
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
  const pct =
    section.capacity > 0
      ? Math.round((section.enlisted / section.capacity) * 100)
      : 0;
  const sport = isPECourse(section.code)
    ? getPESport(section.code, section.section)
    : undefined;

  const groups = groupMeetings(section.meetings);

  return (
    <tr
      onClick={onToggle}
      className={cn(
        "cursor-pointer border-t border-border/30 transition-colors hover:bg-accent/50",
        !included && "opacity-45",
      )}
    >
      {/* Section code + checkbox */}
      <td className="pl-3 pr-2 py-2 align-middle">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-4 rounded flex items-center justify-center shrink-0 border-2 transition-all",
              included
                ? "border-transparent"
                : "border-muted-foreground/40 bg-background dark:bg-input",
            )}
            style={
              included ? { backgroundColor: color, borderColor: color } : {}
            }
          >
            {included && <Check className="size-2.5 text-white stroke-[3]" />}
          </span>
          <div>
            <span className="text-xs font-bold text-foreground">
              {section.section}
            </span>
            {sport && (
              <p className="text-[10px] font-semibold text-foreground/70 leading-tight">
                {sport}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Professor */}
      <td className="px-2 py-2 align-middle text-xs text-muted-foreground">
        {section.professor || "TBA"}
      </td>

      {/* Schedule — one line per time group */}
      <td className="px-2 py-2 align-middle text-xs text-muted-foreground font-mono tabular-nums">
        {groups.length === 0 ? (
          <span>TBA</span>
        ) : (
          groups.map((g, i) => (
            <div key={i} className="leading-snug whitespace-nowrap">
              {fmtTime(g.start)}–{fmtTime(g.end)}
            </div>
          ))
        )}
      </td>

      {/* Room */}
      <td className="px-2 py-2 align-middle text-xs text-muted-foreground">
        {groups.length === 0 ? (
          <span>—</span>
        ) : (
          groups.map((g, i) => (
            <div key={i} className="leading-snug">
              {g.room || <span className="opacity-30">—</span>}
            </div>
          ))
        )}
      </td>

      {/* Days — compact DLSU codes e.g. M/H, T/F */}
      <td className="px-2 py-2 align-middle text-xs font-semibold text-foreground">
        {groups.length === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          groups.map((g, i) => (
            <div key={i} className="leading-snug">
              {g.days}
            </div>
          ))
        )}
      </td>

      {/* Capacity */}
      <td className="pr-3 pl-2 py-2 align-middle text-right">
        <span
          className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded",
            full
              ? "bg-destructive/15 text-destructive dark:bg-destructive/20"
              : pct >= 80
                ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                : "bg-[var(--tertiary-bg)] text-[var(--tertiary)]",
          )}
        >
          {full ? "Full" : `${slots}`}
        </span>
      </td>
    </tr>
  );
}
