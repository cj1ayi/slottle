import type { NextRequest } from "next/server"
import { hubFetch } from "@/lib/hub"

export const dynamic = "force-dynamic"
export const runtime = "edge"

type SectionRef = { courseId: string; sectionId: string }

export type RoomEntry = {
  courseCode: string
  section: string   // e.g. "Z32"
  day: string       // e.g. "T", "F"
  room: string      // e.g. "L332" or "Online"
  classType: string // e.g. "Lecture"
}

/** Extract Room, Type, and Section from the HTML-encoded COURSE_NAME field. */
function parseCourseName(html: string): { room: string; classType: string; section: string } {
  return {
    room:      html.match(/Room\s*:\s*([^<]+)/i)?.[1]?.trim() ?? "",
    classType: html.match(/Type\s*:\s*([^<]+)/i)?.[1]?.trim() ?? "",
    section:   html.match(/Section\s*:\s*([^<]+)/i)?.[1]?.trim() ?? "",
  }
}

const DOW_TO_DAY: Record<number, string> = {
  0: "",   // Sunday — DLSU has no Sunday classes
  1: "M",
  2: "T",
  3: "W",
  4: "Th",
  5: "F",
  6: "S",
}

function dateToDay(dateStr: string): string {
  // Parse as UTC noon to avoid timezone shifts flipping the date
  return DOW_TO_DAY[new Date(`${dateStr}T12:00:00Z`).getUTCDay()] ?? ""
}

export async function POST(request: NextRequest) {
  const cookie = request.headers.get("x-archers-cookie")
  if (!cookie) return Response.json({ error: "Missing cookie" }, { status: 401 })
  const sessionId = request.headers.get("x-academic-session") ?? "4"

  let refs: SectionRef[]
  try {
    refs = await request.json()
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 })
  }
  if (!Array.isArray(refs) || refs.length === 0) return Response.json([])

  // The server ignores STARTDATE/ENDDATE and returns all meetings for the
  // academic session, so any date range works.
  const params = new URLSearchParams({
    STARTDATE: "2026-06-01",
    ENDDATE: "2026-06-07",
    ACADEMICSESSIONID: sessionId,
  })
  refs.forEach(({ courseId, sectionId }, i) => {
    params.set(`enlistmentSchedule[${i}][COURSE_CREATION_ID]`, courseId)
    params.set(`enlistmentSchedule[${i}][SECTION_CREATION_ID]`, sectionId)
    params.set(`enlistmentSchedule[${i}][BATCH_CREATION_ID]`, "0")
    params.set(`enlistmentSchedule[${i}][CAMPUSNO]`, "7")
  })

  const result = await hubFetch("/CourseFinder/GetScheduleData/", {
    cookie,
    body: params.toString(),
  })
  if (!result.ok) return Response.json([])

  let raw: unknown
  try { raw = JSON.parse(result.text) } catch { return Response.json([]) }
  if (!Array.isArray(raw)) return Response.json([])

  const entries: RoomEntry[] = (raw as Record<string, unknown>[])
    .map((item) => {
      const { room, classType, section } = parseCourseName(String(item.COURSE_NAME ?? ""))
      return {
        courseCode: String(item.COURSE_CODE ?? ""),
        section,
        day: dateToDay(String(item.TIME_TABLE_DATE ?? "")),
        room,
        classType,
      }
    })
    .filter((e) => e.day && e.section)

  return Response.json(entries)
}
