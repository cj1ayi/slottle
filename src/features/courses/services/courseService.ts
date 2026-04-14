import { z } from "zod";
import { apiCourseSchema, apiSectionSchema, type ApiCourse, type ApiSection } from "@/lib/schema";

class CourseService {
  async getCourses(cookie: string, sessionId: string): Promise<ApiCourse[]> {
    const r = await fetch("/api/courses", {
      headers: { "x-archers-cookie": cookie, "x-academic-session": sessionId },
    });
    const body = await r.json();
    if (!r.ok)
      throw new Error(body.error + (body.detail ? ` — ${body.detail}` : ""));
    const parsed = z.array(apiCourseSchema).safeParse(body);
    if (!parsed.success)
      throw new Error("Unexpected course list shape from server");
    return parsed.data;
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
    if (!r.ok) throw new Error(body.error ?? "Failed to load sections");
    const parsed = z.array(apiSectionSchema).safeParse(body);
    if (!parsed.success)
      throw new Error("Unexpected section data shape from server");
    return parsed.data;
  }
}

export const courseService = new CourseService();
