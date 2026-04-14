"use client";

import type { UserSchedule } from "@/types";
import { SavedScheduleCard } from "./SavedScheduleCard";

type Props = {
  saved: UserSchedule[];
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
};

export function SavedList({ saved, onRename, onRemove }: Props) {
  if (saved.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">
        Saved schedules ({saved.length})
      </h2>
      <ul className="space-y-2">
        {saved.map((entry) => (
          <SavedScheduleCard
            key={entry.id}
            entry={entry}
            onRename={(name) => onRename(entry.id, name)}
            onRemove={() => onRemove(entry.id)}
          />
        ))}
      </ul>
    </section>
  );
}
