"use client";

import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScheduleGrid } from "@/features/calendar/components/ScheduleGrid";
import { meetingSummary } from "@/lib/utils";
import type { Course, UserSchedule } from "@/types";

type Props = {
  entry: UserSchedule;
  onRename: (name: string) => void;
  onRemove: () => void;
};

export function SavedScheduleCard({ entry, onRename, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.name);

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== entry.name) onRename(trimmed);
    else setDraft(entry.name);
    setEditing(false);
  }

  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <li className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
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

        {editing ? (
          <Input
            autoFocus
            className="flex-1 min-w-0 bg-transparent border-0 border-b border-ring rounded-none px-0 focus-visible:ring-0"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setDraft(entry.name);
                setEditing(false);
              }
            }}
          />
        ) : (
          <button
            className="flex-1 min-w-0 text-left"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="text-sm font-medium truncate block">
              {entry.name}
            </span>
          </button>
        )}

        <span className="text-xs text-muted-foreground shrink-0">{date}</span>
        <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)}>
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onRemove}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {open && (
        <div className="border-t border-border">
          <div className="p-3">
            <ScheduleGrid
              schedule={entry.schedule}
              courses={entry.courses as Course[]}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-3">
            {entry.schedule.sections.map((s) => {
              const course = entry.courses.find((c) => c.code === s.code);
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
        </div>
      )}
    </li>
  );
}
