import { nanoid } from "nanoid";
import type { Course, Schedule, Section } from "@/types";
import { sectionsConflict } from "./conflicts";

/** Maximum valid schedules to return — prevents memory exhaustion. */
export const MAX_RESULTS = 1_000;

/** Maximum estimated combinations (product of section counts) before refusing to run. */
export const MAX_PRODUCT = 500_000;

export function generateSchedules(courses: Course[]): Schedule[] {
  const results: Schedule[] = [];
  const sections = courses.map((c) => c.sections);

  function backtrack(index: number, current: Section[]) {
    if (results.length >= MAX_RESULTS) return;
    if (index === sections.length) {
      results.push({ id: nanoid(), sections: [...current] });
      return;
    }

    for (const section of sections[index]) {
      if (results.length >= MAX_RESULTS) return;
      const hasConflict = current.some((s) =>
        sectionsConflict(s.meetings, section.meetings),
      );

      if (!hasConflict) {
        current.push(section);
        backtrack(index + 1, current);
        current.pop();
      }
    }
  }

  backtrack(0, []);
  return results;
}
