"use client";

import { useState } from "react";
import type { Course, Schedule } from "@/types";
import { generateSchedules, MAX_PRODUCT, MAX_RESULTS } from "../utils/generator";

type UseScheduler = {
  // state
  schedules: Schedule[];
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
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [truncated, setTruncated] = useState(false);

  function generate(
    selectedCourses: Course[],
    includedSectionIds: Record<string, Set<string>>,
  ) {
    const coursesForGen = selectedCourses
      .map((c) => ({
        ...c,
        sections: c.sections.filter(
          (s) => includedSectionIds[c.id]?.has(s.id) ?? false,
        ),
      }))
      .filter((c) => c.sections.length > 0);

    if (coursesForGen.length === 0) return;

    // Pre-flight: estimate worst-case combinations (product of section counts).
    // This bounds how long backtracking can run before the MAX_RESULTS cap kicks in.
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

    // setTimeout defers the synchronous computation by one tick so React can
    // paint the generating spinner before the main thread is occupied.
    setTimeout(() => {
      const results = generateSchedules(coursesForGen);
      setSchedules(results);
      setTruncated(results.length === MAX_RESULTS);
      setActiveIndex(0);
      setGenerating(false);
    }, 0);
  }

  function clearSchedules() {
    setSchedules([]);
    setActiveIndex(0);
    setGenerateError("");
    setTruncated(false);
  }

  return {
    schedules,
    activeIndex,
    generating,
    generateError,
    truncated,
    generate,
    clearSchedules,
    setActiveIndex,
  };
}
