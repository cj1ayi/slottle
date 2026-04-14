import type { ApiCourse, ApiSection } from "@/lib/schema";

class CourseService {
  async getCourses(cookie: string, sessionId: string): Promise<ApiCourse[]> {
    const r = await fetch("/api/courses", {
      headers: { "x-archers-cookie": cookie, "x-academic-session": sessionId },
    });
    const body = await r.json();
    if (!r.ok)
      throw new Error(body.error + (body.detail ? ` — ${body.detail}` : ""));
    return body as ApiCourse[];
  }

  async getSections(
    cookie: string,
    sessionId: string,
    courseId: string,
  ): Promise<ApiSection[]> {
    const r = await fetch(`/api/sections/${courseId}`, {
      headers: { "x-archers-cookie": cookie, "x-academic-session": sessionId },
    });
    const body = await r.json();
    if (!r.ok) throw new Error(body.error);
    return body as ApiSection[];
  }
}

export const courseService = new CourseService();
