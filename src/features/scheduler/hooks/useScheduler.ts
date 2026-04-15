"use client";

import { useCallback, useState } from "react";
import type { Course } from "@/types";
import { useStore } from "@/store";
import { generateSchedules, MAX_PRODUCT, MAX_RESULTS } from "../utils/generator";

type UseScheduler = {
  // state
  schedules: ReturnType<typeof useStore.getState>["generated"];
  activeIndex: number;
  generating: boolean;
  generateError: string;
  truncated: boolean;
  // actions
  generate: (
    selectedCourses: Course[],
    includedSectionIds: Record<string, Set<string>>,
  ) => void;
  clearSchedules: () => void;
  setActiveIndex: (index: number) => void;
};

export function useScheduler(): UseScheduler {
  const schedules = useStore((s) => s.generated);
  const activeIndex = useStore((s) => s.activeScheduleIndex);
  const setGenerated = useStore((s) => s.setGenerated);
  const setActiveScheduleIndex = useStore((s) => s.setActiveScheduleIndex);
  const clearGenerated = useStore((s) => s.clearGenerated);

  // These remain local — they are truly transient UI state that should not
  // survive navigation or be shared across components.
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [truncated, setTruncated] = useState(false);

  const generate = useCallback(
    (
      selectedCourses: Course[],
      includedSectionIds: Record<string, Set<string>>,
    ) => {
      const coursesForGen = selectedCourses
        .map((c) => ({
          ...c,
          sections: c.sections.filter(
            (s) => includedSectionIds[c.id]?.has(s.id) ?? false,
          ),
        }))
        .filter((c) => c.sections.length > 0);

      if (coursesForGen.length === 0) return;

      const estimate = coursesForGen.reduce((p, c) => p * c.sections.length, 1);
      if (estimate > MAX_PRODUCT) {
        setGenerateError(
          `Too many possible combinations (~${estimate.toLocaleString()}). Deselect some sections to bring this under ${MAX_PRODUCT.toLocaleString()}.`,
        );
        return;
      }

      setGenerateError("");
      setTruncated(false);
      setGenerating(true);

      setTimeout(() => {
        const results = generateSchedules(coursesForGen);
        setGenerated(results);
        setTruncated(results.length === MAX_RESULTS);
        setGenerating(false);
      }, 0);
    },
    [setGenerated],
  );

  const clearSchedules = useCallback(() => {
    clearGenerated();
    setGenerateError("");
    setTruncated(false);
  }, [clearGenerated]);

  return {
    schedules,
    activeIndex,
    generating,
    generateError,
    truncated,
    generate,
    clearSchedules,
    setActiveIndex: setActiveScheduleIndex,
  };
}
