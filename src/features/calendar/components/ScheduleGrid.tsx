"use client";

import type { Course, Day, Schedule } from "@/types";

const DAYS: Day[] = ["M", "T", "W", "Th", "F", "S"];
const DAY_LABELS: Record<Day, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  Th: "Thursday",
  F: "Friday",
  S: "Saturday",
};

// Grid: 7:30 AM – 9:00 PM
const GRID_START = 730;
const GRID_END = 2100;
const ROW_PX = 48; // px per 30-min slot

function toMins(hhmm: number) {
  return Math.floor(hhmm / 100) * 60 + (hhmm % 100);
}
function topPx(t: number) {
  return ((toMins(t) - toMins(GRID_START)) / 30) * ROW_PX;
}
function heightPx(start: number, end: number) {
  return ((toMins(end) - toMins(start)) / 30) * ROW_PX;
}
function fmt(hhmm: number) {
  const h = Math.floor(hhmm / 100);
  const m = hhmm % 100;
  const ap = h >= 12 ? "PM" : "AM";
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${dh}:${String(m).padStart(2, "0")} ${ap}`;
}

const totalRows = (toMins(GRID_END) - toMins(GRID_START)) / 30;
const gridH = totalRows * ROW_PX;

const hourLabels: number[] = [];
for (let t = GRID_START; t <= GRID_END; t += 100) hourLabels.push(t);

type Props = { schedule: Schedule; courses: Course[] };

export function ScheduleGrid({ schedule, courses }: Props) {
  const colorMap = new Map(courses.map((c) => [c.code, c.color]));

  const activeDays = DAYS.filter((day) =>
    schedule.sections.some((s) => s.meetings.some((m) => m.day === day)),
  );
  const displayDays = activeDays.length > 0 ? activeDays : DAYS;
  const TIME_COL = "3.5rem";

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 520 }}>
        {/* ── Day header ─────────────────────────────────────────── */}
        <div
          className="grid border-b border-border"
          style={{
            gridTemplateColumns: `${TIME_COL} repeat(${displayDays.length}, 1fr)`,
          }}
        >
          <div />
          {displayDays.map((day) => (
            <div
              key={day}
              className="py-2.5 text-center text-[10px] font-bold tracking-widest uppercase text-muted-foreground border-l border-border"
            >
              {DAY_LABELS[day]}
            </div>
          ))}
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `${TIME_COL} repeat(${displayDays.length}, 1fr)`,
            height: gridH,
          }}
        >
          {/* Time labels */}
          <div className="relative">
            {hourLabels.map((t) => (
              <div
                key={t}
                className="absolute right-2 text-[9px] font-mono text-muted-foreground/50 leading-none"
                style={{ top: topPx(t) - 5 }}
              >
                {fmt(t)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {displayDays.map((day) => (
            <div
              key={day}
              className="relative border-l border-border"
              style={{ height: gridH }}
            >
              {/* Slot lines */}
              {Array.from({ length: totalRows }, (_, i) => (
                <div
                  key={i}
                  className="absolute inset-x-0 border-t"
                  style={{
                    top: i * ROW_PX,
                    height: ROW_PX,
                    borderColor:
                      i % 2 === 0
                        ? "color-mix(in oklch, var(--border) 70%, transparent)"
                        : "color-mix(in oklch, var(--border) 30%, transparent)",
                  }}
                />
              ))}

              {/* Blocks */}
              {schedule.sections.map((section) =>
                section.meetings
                  .filter((m) => m.day === day)
                  .map((meeting, idx) => {
                    const color = colorMap.get(section.code) ?? "#6B7280";
                    const top = topPx(meeting.start);
                    const height = heightPx(meeting.start, meeting.end);
                    return (
                      <div
                        key={`${section.id}-${idx}`}
                        className="absolute inset-x-0.5 overflow-hidden rounded-sm px-2 py-1.5"
                        style={{
                          top,
                          height,
                          backgroundColor: `${color}28`,
                          borderLeft: `3px solid ${color}`,
                        }}
                      >
                        <p
                          className="text-[11px] font-bold leading-tight truncate"
                          style={{ color }}
                        >
                          {section.code}
                        </p>
                        <p
                          className="text-[10px] leading-tight truncate"
                          style={{ color: `${color}bb` }}
                        >
                          {section.section}
                        </p>
                        {height >= 64 && (
                          <p
                            className="text-[10px] leading-tight truncate mt-0.5"
                            style={{ color: `${color}88` }}
                          >
                            {section.professor || "TBA"}
                          </p>
                        )}
                        {height >= 96 && meeting.room && (
                          <p
                            className="text-[10px] leading-tight truncate mt-0.5 font-medium"
                            style={{ color: `${color}99` }}
                          >
                            {meeting.room}
                          </p>
                        )}
                      </div>
                    );
                  }),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
