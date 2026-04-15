import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Meeting } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtTime(t: number): string {
  const h = Math.floor(t / 100);
  const m = t % 100;
  const ampm = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${ampm}`;
}

const DAY_FULL: Record<string, string> = {
  M: "Mon", T: "Tue", W: "Wed", Th: "Thu", F: "Fri", S: "Sat",
};
/** Unambiguous full day name ("Tue", "Thu") for legends and summaries. */
export function dayLabel(day: string): string {
  return DAY_FULL[day] ?? day;
}

/** Sort index for M → T → W → Th → F → S. */
const DAY_ORDER: Record<string, number> = {
  M: 0, T: 1, W: 2, Th: 3, F: 4, S: 5,
};

/**
 * Compact DLSU-style single-char day codes.
 * Thursday → "H" (Huwebes), all others keep their English initial.
 */
const DAY_DLSU: Record<string, string> = {
  M: "M", T: "T", W: "W", Th: "H", F: "F", S: "S",
};

export type MeetingGroup = {
  start: number;
  end: number;
  /** e.g. "M/H", "T/F", "W" */
  days: string;
  /** Unique rooms for this time slot, "/" joined. Empty string if unknown. */
  room: string;
};

/**
 * Sort meetings by day order, then group those with the same time range into
 * a single MeetingGroup so they can be rendered on one row.
 */
export function groupMeetings(meetings: Meeting[]): MeetingGroup[] {
  if (meetings.length === 0) return [];

  const sorted = [...meetings].sort(
    (a, b) => (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99),
  );

  const map = new Map<string, Meeting[]>();
  for (const m of sorted) {
    const key = `${m.start}-${m.end}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }

  return [...map.values()].map((group) => {
    const days = group.map((m) => DAY_DLSU[m.day] ?? m.day).join("/");
    const uniqueRooms = [
      ...new Set(group.map((m) => m.room).filter((r) => r.length > 0)),
    ];
    return {
      start: group[0].start,
      end: group[0].end,
      days,
      room: uniqueRooms.join(" / "),
    };
  });
}

/** One-line schedule summary used in legends (sorts days, uses full names). */
export function meetingSummary(meetings: Meeting[]): string {
  if (meetings.length === 0) return "TBA";
  const sorted = [...meetings].sort(
    (a, b) => (DAY_ORDER[a.day] ?? 99) - (DAY_ORDER[b.day] ?? 99),
  );
  return sorted
    .map((m) => {
      const time = `${dayLabel(m.day)} ${fmtTime(m.start)}–${fmtTime(m.end)}`;
      return m.room ? `${time} · ${m.room}` : time;
    })
    .join("  ");
}
