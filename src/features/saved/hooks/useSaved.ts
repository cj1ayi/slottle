"use client";

import { useStore } from "@/store";
import type { Course, SavedCourse, Schedule, UserSchedule } from "@/types";

type UseSaved = {
  // state
  saved: UserSchedule[];
  // actions
  saveCurrentSchedule: (schedule: Schedule, selectedCourses: Course[]) => void;
  renameSaved: (id: string, name: string) => void;
  removeSaved: (id: string) => void;
};

export function useSaved(): UseSaved {
  const saved = useStore((s) => s.saved);
  const saveSchedule = useStore((s) => s.saveSchedule);
  const renameSaved = useStore((s) => s.renameSaved);
  const removeSaved = useStore((s) => s.removeSaved);

  function saveCurrentSchedule(schedule: Schedule, selectedCourses: Course[]) {
    if (!schedule) return;
    const courses: SavedCourse[] = selectedCourses.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      color: c.color,
      units: c.units,
    }));
    const entry: UserSchedule = {
      id: crypto.randomUUID(),
      name: `Schedule ${saved.length + 1}`,
      schedule,
      courses,
      createdAt: Date.now(),
    };
    saveSchedule(entry);
  }

  return {
    saved,
    saveCurrentSchedule,
    renameSaved,
    removeSaved,
  };
}
