import type { ApiCourse, ApiSection } from "@/lib/schema";
import type { Course, Day, Meeting, Section } from "@/types";
import type { RoomEntry } from "@/app/api/schedule-data/route";

const DAY_MAP: Record<string, Day> = {
  MON: "M",
  TUE: "T",
  WED: "W",
  THU: "Th",
  FRI: "F",
  SAT: "S",
};

// "07:30 AM" → 730, "01:30 PM" → 1330
function parseTime(token: string): number {
  const [hhmm, period] = token.trim().split(" ");
  const [hStr, mStr] = hhmm.split(":");
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 100 + minutes;
}

// "[ FRI - 07:30 AM - 09:00 AM ] [ TUE - 07:30 AM - 09:00 AM ]"
// → [{ day: "F", start: 730, end: 900 }, { day: "T", start: 730, end: 900 }]
export function parseSchedule(
  schedule: string,
): Omit<Meeting, "room" | "modality">[] {
  const pattern =
    /\[\s*(\w+)\s*-\s*([\d:]+\s+[AP]M)\s*-\s*([\d:]+\s+[AP]M)\s*\]/g;
  const meetings: Omit<Meeting, "room" | "modality">[] = [];

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(schedule)) !== null) {
    const [, dayStr, startStr, endStr] = match;
    const day = DAY_MAP[dayStr.toUpperCase()];
    if (!day) continue;
    meetings.push({
      day,
      start: parseTime(startStr),
      end: parseTime(endStr),
    });
  }

  return meetings;
}

export function apiSectionToSection(
  apiSection: ApiSection,
  courseCode: string,
): Section {
  const meetings: Meeting[] = parseSchedule(apiSection.SCHEDULE).map((m) => ({
    ...m,
    room: "",
    modality: "F2F" as const,
  }));

  return {
    id: String(apiSection.SECTION_CREATION_ID),
    code: courseCode,
    section: apiSection.SECTION_NAME,
    professor: apiSection.MAIN_TEACHER,
    meetings,
    locked: false,
    capacity: apiSection.CAPACITY,
    enlisted: apiSection.ENLISTED,
  };
}

const COURSE_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#EC4899",
];

export function apiCourseToPartial(
  apiCourse: ApiCourse,
  colorIndex: number,
): Omit<Course, "sections"> {
  return {
    id: String(apiCourse.COURSE_CREATION_ID),
    code: apiCourse.COURSE_NAME,
    name: apiCourse.COURSE_NAME,
    units: 0, // populated after fetching sections
    color: COURSE_COLORS[colorIndex % COURSE_COLORS.length],
  };
}

export function buildCourse(
  apiCourse: ApiCourse,
  apiSections: ApiSection[],
  colorIndex: number,
): Course {
  const partial = apiCourseToPartial(apiCourse, colorIndex);
  const sections = apiSections.map((s) => apiSectionToSection(s, partial.code));
  const units = apiSections[0]?.CREDITS ?? 0;
  return { ...partial, units, sections };
}

/**
 * Patch meeting room and modality onto a Course using data from GetScheduleData.
 * Called after buildCourse as a best-effort enrichment — if entries is empty the
 * original course is returned unchanged.
 */
export function applyRoomData(course: Course, entries: RoomEntry[]): Course {
  if (entries.length === 0) return course;
  return {
    ...course,
    sections: course.sections.map((section) => ({
      ...section,
      meetings: section.meetings.map((meeting) => {
        const entry = entries.find(
          (e) => e.section === section.section && e.day === meeting.day,
        );
        if (!entry) return meeting;
        return {
          ...meeting,
          room: entry.room,
          modality: entry.room === "Online" ? ("Online" as const) : ("F2F" as const),
        };
      }),
    })),
  };
}
