import type { Section, Course, Schedule } from "@/types"

function sectionsConflict(a: Section, b: Section): boolean {
  for (const ma of a.meetings) {
    for (const mb of b.meetings) {
      if (ma.day === mb.day && ma.start < mb.end && mb.start < ma.end) {
        return true
      }
    }
  }
  return false
}

// Given N courses each with M sections, generate all valid non-conflicting
// combinations (one section per course).
export function generateSchedules(courses: Course[]): Schedule[] {
  if (courses.length === 0) return []

  const results: Schedule[] = []

  function backtrack(courseIndex: number, chosen: Section[]) {
    if (courseIndex === courses.length) {
      results.push({
        id: crypto.randomUUID(),
        sections: [...chosen],
      })
      return
    }

    for (const section of courses[courseIndex].sections) {
      // Skip sections with no meetings (TBA) — can't place them on a grid
      if (section.meetings.length === 0) continue
      const conflicts = chosen.some((s) => sectionsConflict(s, section))
      if (!conflicts) {
        chosen.push(section)
        backtrack(courseIndex + 1, chosen)
        chosen.pop()
      }
    }
  }

  backtrack(0, [])
  return results
}
