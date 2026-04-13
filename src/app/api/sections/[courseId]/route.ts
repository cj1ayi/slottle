import type { NextRequest } from "next/server"
import { z } from "zod"
import { apiSectionSchema } from "@/lib/schema"
import { hubFetch } from "@/lib/hub"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const cookie = request.headers.get("x-archers-cookie")
  if (!cookie) {
    return Response.json({ error: "Missing session cookie" }, { status: 401 })
  }

  const { courseId } = await params
  const session = request.headers.get("x-academic-session") ?? "4"

  const result = await hubFetch("/CourseFinder/GetCFData/", {
    cookie,
    body: `Campusno=7&AcademicSession=${encodeURIComponent(session)}&CourseId=${encodeURIComponent(courseId)}`,
  })

  if (!result.ok) {
    return Response.json(
      { error: "Archers Hub error", detail: result.detail },
      { status: result.status === 401 || result.status === 403 ? 401 : 502 }
    )
  }

  let raw: unknown
  try {
    raw = JSON.parse(result.text)
  } catch {
    return Response.json(
      { error: "Archers Hub did not return JSON", detail: result.text.slice(0, 400) },
      { status: 502 }
    )
  }

  if (typeof raw === "string") {
    return Response.json(
      { error: "Cookie expired or invalid session — please re-paste your cookie", detail: raw },
      { status: 401 }
    )
  }

  const parsed = z.array(apiSectionSchema).safeParse(raw)
  if (!parsed.success) {
    return Response.json(
      { error: "Unexpected response shape", detail: JSON.stringify(raw).slice(0, 400) },
      { status: 502 }
    )
  }

  return Response.json(parsed.data)
}
