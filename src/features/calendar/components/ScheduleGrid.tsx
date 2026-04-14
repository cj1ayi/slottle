"use client";

import type { Course, Day, Schedule } from "@/types";

const DAYS: Day[] = ["M", "T", "W", "Th", "F", "S"];
const DAY_LABELS: Record<Day, string> = {
  M: "Mon",
  T: "Tue",
  W: "Wed",
  Th: "Thu",
  F: "Fri",
  S: "Sat",
};

// Grid spans 7:00 AM – 10:00 PM
const GRID_START = 700; // 7:00 AM in HHMM
const GRID_END = 2200; // 10:00 PM in HHMM
const ROW_PX = 48; // px per 30-minute slot

function hhmm(time: number): number {
  // HHMM → total minutes since midnight
  return Math.floor(time / 100) * 60 + (time % 100);
}

function topPx(time: number): number {
  return ((hhmm(time) - hhmm(GRID_START)) / 30) * ROW_PX;
}

function heightPx(start: number, end: number): number {
  return ((hhmm(end) - hhmm(start)) / 30) * ROW_PX;
}

function formatTime(time: number): string {
  const h = Math.floor(time / 100);
  const m = time % 100;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
}

const totalRows = (hhmm(GRID_END) - hhmm(GRID_START)) / 30; // 30 slots
const gridHeightPx = totalRows * ROW_PX;

// Hour labels shown every 60 min
const hourLabels: number[] = [];
for (let t = GRID_START; t <= GRID_END; t += 100) {
  hourLabels.push(t);
}

type Props = {
  schedule: Schedule;
  courses: Course[];
};

export function ScheduleGrid({ schedule, courses }: Props) {
  const colorMap = new Map(courses.map((c) => [c.code, c.color]));

  // Determine which days have classes so we only render those columns
  const activeDays = DAYS.filter((day) =>
    schedule.sections.some((s) => s.meetings.some((m) => m.day === day)),
  );
  const displayDays = activeDays.length > 0 ? activeDays : DAYS;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        {/* Header row */}
        <div
          className="grid border-b border-border"
          style={{
            gridTemplateColumns: `4rem repeat(${displayDays.length}, 1fr)`,
          }}
        >
          <div />
          {displayDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide border-l border-border"
            >
              {DAY_LABELS[day]}
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `4rem repeat(${displayDays.length}, 1fr)`,
            height: gridHeightPx,
          }}
        >
          {/* Time labels column */}
          <div className="relative">
            {hourLabels.map((t) => (
              <div
                key={t}
                className="absolute right-2 text-[10px] text-muted-foreground leading-none"
                style={{ top: topPx(t) - 6 }}
              >
                {formatTime(t)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {displayDays.map((day) => (
            <div
              key={day}
              className="relative border-l border-border"
              style={{ height: gridHeightPx }}
            >
              {/* 30-min slot lines */}
              {Array.from({ length: totalRows }, (_, i) => (
                <div
                  key={i}
                  className="absolute inset-x-0 border-t border-border/40"
                  style={{ top: i * ROW_PX, height: ROW_PX }}
                />
              ))}

              {/* Section blocks */}
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
                        className="absolute inset-x-0.5 rounded-md px-1.5 py-1 overflow-hidden"
                        style={{
                          top,
                          height,
                          backgroundColor: `${color}33`,
                          borderLeft: `3px solid ${color}`,
                        }}
                      >
                        <p
                          className="text-[11px] font-semibold leading-tight truncate"
                          style={{ color }}
                        >
                          {section.code}
                        </p>
                        <p className="text-[10px] leading-tight text-foreground/70 truncate">
                          {section.section}
                        </p>
                        {height >= 72 && (
                          <p className="text-[10px] leading-tight text-foreground/60 truncate mt-0.5">
                            {section.professor}
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
