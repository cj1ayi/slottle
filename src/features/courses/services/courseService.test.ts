import { describe, expect, test, mock, beforeEach } from "bun:test"
import { courseService } from "./courseService"

// ── Mock fetch ────────────────────────────────────────────────────────────────

const COOKIE = "test-cookie"
const SESSION = "135"
const COURSE_ID = "42"

function mockFetch(status: number, body: unknown) {
  global.fetch = mock(async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  ) as unknown as typeof fetch
}

beforeEach(() => {
  global.fetch = mock(async () =>
    new Response("{}", { status: 200 })
  ) as unknown as typeof fetch
})

// ── getCourses ────────────────────────────────────────────────────────────────

describe("getCourses", () => {
  test("returns parsed courses on success", async () => {
    mockFetch(200, [
      { COURSE_CREATION_ID: 1, COURSE_NAME: "CCAPDEV" },
      { COURSE_CREATION_ID: 2, COURSE_NAME: "CCPROG3" },
    ])
    const courses = await courseService.getCourses(COOKIE, SESSION)
    expect(courses).toHaveLength(2)
    expect(courses[0].COURSE_NAME).toBe("CCAPDEV")
    expect(courses[1].COURSE_CREATION_ID).toBe(2)
  })

  test("throws on non-ok response with error message", async () => {
    mockFetch(401, { error: "Missing session cookie" })
    expect(courseService.getCourses(COOKIE, SESSION)).rejects.toThrow("Missing session cookie")
  })

  test("throws with detail appended when present", async () => {
    mockFetch(502, { error: "Archers Hub error", detail: "Object reference not set" })
    expect(courseService.getCourses(COOKIE, SESSION)).rejects.toThrow(
      "Archers Hub error — Object reference not set"
    )
  })

  test("throws on unexpected response shape", async () => {
    mockFetch(200, { unexpected: "shape" })
    expect(courseService.getCourses(COOKIE, SESSION)).rejects.toThrow(
      "Unexpected course list shape from server"
    )
  })

  test("throws when response is a plain string (ASP.NET exception)", async () => {
    global.fetch = mock(async () =>
      new Response(JSON.stringify("Object reference not set to an instance of an object."), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    ) as unknown as typeof fetch
    expect(courseService.getCourses(COOKIE, SESSION)).rejects.toThrow()
  })

  test("sends correct headers", async () => {
    let capturedHeaders: Record<string, string> = {}
    global.fetch = mock(async (_url: string, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string>
      return new Response(JSON.stringify([]), { status: 200 })
    }) as unknown as typeof fetch
    await courseService.getCourses(COOKIE, SESSION)
    expect(capturedHeaders["x-archers-cookie"]).toBe(COOKIE)
    expect(capturedHeaders["x-academic-session"]).toBe(SESSION)
  })
})

// ── getSections ───────────────────────────────────────────────────────────────

describe("getSections", () => {
  const validSection = {
    COURSE_CREATION_ID: 1,
    SECTION_CREATION_ID: 101,
    SECTION_NAME: "S11",
    SUBJECT_NAME: "CCAPDEV",
    CREDITS: 3,
    MAIN_TEACHER: "Juan",
    SCHEDULE: "[ MON - 07:30 AM - 09:00 AM ]",
    SESSION: "135",
    CAPACITY: 40,
    ENLISTED: 20,
  }

  test("returns parsed sections on success", async () => {
    mockFetch(200, [validSection])
    const sections = await courseService.getSections(COOKIE, SESSION, COURSE_ID)
    expect(sections).toHaveLength(1)
    expect(sections[0].SECTION_NAME).toBe("S11")
    expect(sections[0].CREDITS).toBe(3)
  })

  test("ENLISTED defaults to 0 when missing", async () => {
    const { ENLISTED: _, ...withoutEnlisted } = validSection
    mockFetch(200, [withoutEnlisted])
    const sections = await courseService.getSections(COOKIE, SESSION, COURSE_ID)
    expect(sections[0].ENLISTED).toBe(0)
  })

  test("throws on non-ok response", async () => {
    mockFetch(401, { error: "Cookie expired or invalid session" })
    expect(courseService.getSections(COOKIE, SESSION, COURSE_ID)).rejects.toThrow(
      "Cookie expired or invalid session"
    )
  })

  test("throws on unexpected response shape", async () => {
    mockFetch(200, [{ wrong: "shape" }])
    expect(courseService.getSections(COOKIE, SESSION, COURSE_ID)).rejects.toThrow(
      "Unexpected section data shape from server"
    )
  })

  test("calls correct URL with courseId", async () => {
    let capturedUrl = ""
    global.fetch = mock(async (url: string) => {
      capturedUrl = url
      return new Response(JSON.stringify([validSection]), { status: 200 })
    }) as unknown as typeof fetch
    await courseService.getSections(COOKIE, SESSION, "99")
    expect(capturedUrl).toBe("/api/sections/99")
  })

  test("sends correct headers", async () => {
    let capturedHeaders: Record<string, string> = {}
    global.fetch = mock(async (_url: string, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string>
      return new Response(JSON.stringify([validSection]), { status: 200 })
    }) as unknown as typeof fetch
    await courseService.getSections(COOKIE, SESSION, COURSE_ID)
    expect(capturedHeaders["x-archers-cookie"]).toBe(COOKIE)
    expect(capturedHeaders["x-academic-session"]).toBe(SESSION)
  })
})
