import type { NextRequest } from "next/server";
import { z } from "zod";
import { hubFetch } from "@/lib/hub";
import { apiCourseSchema } from "@/lib/schema";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const cookie = request.headers.get("x-archers-cookie");
  if (!cookie) {
    return Response.json({ error: "Missing session cookie" }, { status: 401 });
  }

  const session = request.headers.get("x-academic-session") ?? "4";
  const body = `Campusno=7&AcademicSession=${encodeURIComponent(session)}`;

  const result = await hubFetch("/CourseFinder/GetCourseList/", {
    cookie,
    body,
  });

  if (!result.ok) {
    return Response.json(
      { error: "Archers Hub error", detail: result.detail },
      { status: result.status === 401 || result.status === 403 ? 401 : 502 },
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(result.text);
  } catch {
    return Response.json(
      {
        error: "Archers Hub did not return JSON",
        detail: result.text.slice(0, 400),
      },
      { status: 502 },
    );
  }

  // ASP.NET returns a plain JSON string for server-side exceptions (NullReferenceException
  // etc.) — this almost always means the cookie is expired or the session ID is wrong.
  if (typeof raw === "string") {
    return Response.json(
      {
        error:
          "Archers Hub returned an error — your cookie may be expired, or this term has no data yet. Try switching terms or re-pasting your cookie.",
        detail: raw,
      },
      { status: 401 },
    );
  }

  const envelope = z
    .object({ CourseDrp: z.array(apiCourseSchema) })
    .safeParse(raw);
  if (!envelope.success) {
return Response.json(
      {
        error: "Unexpected response shape",
        detail: JSON.stringify(raw).slice(0, 400),
      },
      { status: 502 },
    );
  }

  return Response.json(envelope.data.CourseDrp);
}
