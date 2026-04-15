import { describe, expect, test } from "bun:test"
import { parseSchedule, apiSectionToSection, apiCourseToPartial, buildCourse } from "@/lib/parser"
import type { ApiSection, ApiCourse } from "@/lib/schema"

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeApiSection(overrides: Partial<ApiSection> = {}): ApiSection {
  return {
    COURSE_CREATION_ID: 1,
    SECTION_CREATION_ID: 101,
    SECTION_NAME: "S11",
    SUBJECT_NAME: "CCAPDEV",
    CREDITS: 3,
    MAIN_TEACHER: "Juan dela Cruz",
    SCHEDULE: "[ MON - 07:30 AM - 09:00 AM ]",
    SESSION: "135",
    CAPACITY: 40,
    ENLISTED: 20,
    ...overrides,
  }
}

function makeApiCourse(overrides: Partial<ApiCourse> = {}): ApiCourse {
  return {
    COURSE_CREATION_ID: 1,
    COURSE_NAME: "CCAPDEV",
    ...overrides,
  }
}

// ── parseSchedule ─────────────────────────────────────────────────────────────

describe("parseSchedule", () => {
  test("single AM slot", () => {
    const result = parseSchedule("[ MON - 07:30 AM - 09:00 AM ]")
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ day: "M", start: 730, end: 900 })
  })

  test("single PM slot", () => {
    const result = parseSchedule("[ FRI - 01:00 PM - 02:30 PM ]")
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ day: "F", start: 1300, end: 1430 })
  })

  test("12:00 PM is noon (1200), not 0", () => {
    const result = parseSchedule("[ MON - 12:00 PM - 01:30 PM ]")
    expect(result[0].start).toBe(1200)
    expect(result[0].end).toBe(1330)
  })

  test("12:00 AM is midnight (0)", () => {
    const result = parseSchedule("[ MON - 12:00 AM - 01:00 AM ]")
    expect(result[0].start).toBe(0)
    expect(result[0].end).toBe(100)
  })

  test("multiple slots", () => {
    const result = parseSchedule(
      "[ FRI - 07:30 AM - 09:00 AM ] [ TUE - 07:30 AM - 09:00 AM ]"
    )
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ day: "F", start: 730, end: 900 })
    expect(result[1]).toEqual({ day: "T", start: 730, end: 900 })
  })

  test("THU maps to Th not T", () => {
    const result = parseSchedule("[ THU - 10:00 AM - 11:30 AM ]")
    expect(result[0].day).toBe("Th")
  })

  test("SAT maps to S", () => {
    const result = parseSchedule("[ SAT - 08:00 AM - 09:30 AM ]")
    expect(result[0].day).toBe("S")
  })

  test("unknown day code is skipped", () => {
    const result = parseSchedule("[ SUN - 08:00 AM - 09:30 AM ]")
    expect(result).toHaveLength(0)
  })

  test("empty string returns empty array", () => {
    expect(parseSchedule("")).toHaveLength(0)
  })

  test("malformed string returns empty array", () => {
    expect(parseSchedule("TBA")).toHaveLength(0)
    expect(parseSchedule("[ MON ]")).toHaveLength(0)
    expect(parseSchedule("garbage input 123")).toHaveLength(0)
  })

  test("extra whitespace is handled", () => {
    const result = parseSchedule("[  MON  -  07:30 AM  -  09:00 AM  ]")
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ day: "M", start: 730, end: 900 })
  })
})

// ── apiSectionToSection ───────────────────────────────────────────────────────

describe("apiSectionToSection", () => {
  test("maps fields correctly", () => {
    const section = apiSectionToSection(makeApiSection(), "CCAPDEV")
    expect(section.id).toBe("101")
    expect(section.code).toBe("CCAPDEV")
    expect(section.section).toBe("S11")
    expect(section.professor).toBe("Juan dela Cruz")
    expect(section.capacity).toBe(40)
    expect(section.enlisted).toBe(20)
    expect(section.locked).toBe(false)
  })

  test("meetings are parsed from SCHEDULE", () => {
    const section = apiSectionToSection(makeApiSection(), "CCAPDEV")
    expect(section.meetings).toHaveLength(1)
    expect(section.meetings[0].day).toBe("M")
    expect(section.meetings[0].start).toBe(730)
    expect(section.meetings[0].end).toBe(900)
    expect(section.meetings[0].room).toBe("")
    expect(section.meetings[0].modality).toBe("F2F")
  })

  test("TBA schedule produces empty meetings", () => {
    const section = apiSectionToSection(makeApiSection({ SCHEDULE: "TBA" }), "CCAPDEV")
    expect(section.meetings).toHaveLength(0)
  })

  test("multiple meetings in schedule", () => {
    const section = apiSectionToSection(
      makeApiSection({ SCHEDULE: "[ MON - 07:30 AM - 09:00 AM ] [ WED - 07:30 AM - 09:00 AM ]" }),
      "CCAPDEV"
    )
    expect(section.meetings).toHaveLength(2)
  })
})

// ── apiCourseToPartial ────────────────────────────────────────────────────────

describe("apiCourseToPartial", () => {
  test("maps id and name", () => {
    const partial = apiCourseToPartial(makeApiCourse(), 0)
    expect(partial.id).toBe("1")
    expect(partial.code).toBe("CCAPDEV")
    expect(partial.name).toBe("CCAPDEV")
    expect(partial.units).toBe(0)
  })

  test("color wraps around the palette", () => {
    const first = apiCourseToPartial(makeApiCourse(), 0)
    const ninth = apiCourseToPartial(makeApiCourse(), 8) // 8 colors in palette
    expect(first.color).toBe(ninth.color)
  })

  test("different color indices give different colors", () => {
    const a = apiCourseToPartial(makeApiCourse(), 0)
    const b = apiCourseToPartial(makeApiCourse(), 1)
    expect(a.color).not.toBe(b.color)
  })
})

// ── buildCourse ───────────────────────────────────────────────────────────────

describe("buildCourse", () => {
  test("builds a full course from api shapes", () => {
    const course = buildCourse(makeApiCourse(), [makeApiSection()], 0)
    expect(course.id).toBe("1")
    expect(course.code).toBe("CCAPDEV")
    expect(course.units).toBe(3) // from CREDITS
    expect(course.sections).toHaveLength(1)
  })

  test("units defaults to 0 when no sections", () => {
    const course = buildCourse(makeApiCourse(), [], 0)
    expect(course.units).toBe(0)
    expect(course.sections).toHaveLength(0)
  })

  test("units taken from first section CREDITS", () => {
    const sections = [
      makeApiSection({ CREDITS: 3 }),
      makeApiSection({ SECTION_CREATION_ID: 102, CREDITS: 3 }),
    ]
    const course = buildCourse(makeApiCourse(), sections, 0)
    expect(course.units).toBe(3)
    expect(course.sections).toHaveLength(2)
  })
})
