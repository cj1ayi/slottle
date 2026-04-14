import { nanoid } from "nanoid";
import type { Course, Schedule, Section } from "@/types";
import { sectionsConflict } from "./conflicts";

export function generateSchedules(courses: Course[]): Schedule[] {
  const results: Schedule[] = [];
  const sections = courses.map((c) => c.sections);

  function backtrack(index: number, current: Section[]) {
    if (index === sections.length) {
      results.push({ id: nanoid(), sections: [...current] });
      return;
    }

    for (const section of sections[index]) {
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
