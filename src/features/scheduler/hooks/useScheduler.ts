"use client";

import { useState } from "react";
import type { Course, Schedule } from "@/types";
import { generateSchedules } from "../utils/generator";

type UseScheduler = {
  // state
  schedules: Schedule[];
  activeIndex: number;
  generating: boolean;
  // actions
  generate: (
    selectedCourses: Course[],
    includedSectionIds: Record<string, Set<string>>,
  ) => void;
  clearSchedules: () => void;
  setActiveIndex: (index: number) => void;
};

export function useScheduler(): UseScheduler {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [generating, setGenerating] = useState(false);

  function generate(
    selectedCourses: Course[],
    includedSectionIds: Record<string, Set<string>>,
  ) {
    // Build courses using only the user-selected sections
    const coursesForGen = selectedCourses
      .map((c) => ({
        ...c,
        sections: c.sections.filter(
          (s) => includedSectionIds[c.id]?.has(s.id) ?? false,
        ),
      }))
      .filter((c) => c.sections.length > 0);

    if (coursesForGen.length === 0) return;
    setGenerating(true);
    setTimeout(() => {
      setSchedules(generateSchedules(coursesForGen));
      setActiveIndex(0);
      setGenerating(false);
    }, 0);
  }

  function clearSchedules() {
    setSchedules([]);
    setActiveIndex(0);
  }

  return {
    schedules,
    activeIndex,
    generating,
    generate,
    clearSchedules,
    setActiveIndex,
  };
}
