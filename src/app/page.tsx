"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Search,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useStore } from "@/store";
import { CookieSetup } from "@/features/auth/components/CookieSetup";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { useScheduler } from "@/features/scheduler/hooks/useScheduler";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { ScheduleGrid } from "@/features/calendar/components/ScheduleGrid";
import { meetingSummary, groupMeetings, fmtTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  NavLogo,
  NavLink,
  NavTab,
  NavBadge,
  NavRightIcons,
} from "@/components/layout/NavPrimitives";
import { isPECourse, getPESport } from "@/data/peSections";
import type { ApiCourse } from "@/lib/schema";
import type { Course, Section } from "@/types";

const SESSIONS = [
  { id: "135", label: "Term 3" },
  { id: "4", label: "Term 2" },
];

type Tab = "courses" | "schedules";

export default function Home() {
  const cookie = useStore((s) => s.cookie);
  const setCookie = useStore((s) => s.setCookie);
  const clearCookie = useStore((s) => s.clearCookie);
  const clearCourses = useStore((s) => s.clearCourses);

  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated());
  const [sessionId, setSessionId] = useState("135");
  const [tab, setTab] = useState<Tab>("courses");
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  const courses = useCourses();
  const scheduler = useScheduler();
  const saved = useSaved();
  const lastFetchedCookie = useRef("");

  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    useStore.persist.rehydrate();
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated || !cookie || lastFetchedCookie.current === cookie) return;
    lastFetchedCookie.current = cookie;
    courses.loadCourses(cookie, sessionId);
    // biome-ignore lint/correctness/useExhaustiveDependencies: loadCourses is stable
  }, [hydrated, cookie]);

  // Auto-select first course when stack changes
  useEffect(() => {
    if (courses.selectedCourses.length > 0) {
      setActiveCourseId((prev) =>
        courses.selectedCourses.find((c) => c.id === prev)
          ? prev
          : courses.selectedCourses[0].id,
      );
    } else {
      setActiveCourseId(null);
    }
  }, [courses.selectedCourses]);

  // Auto-switch to schedules tab when generation finishes
  useEffect(() => {
    if (scheduler.schedules.length > 0 && !scheduler.generating) {
      setTab("schedules");
    }
  }, [scheduler.schedules.length, scheduler.generating]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  function selectSession(sid: string) {
    setSessionId(sid);
    clearCourses();
    scheduler.clearSchedules();
    courses.loadCourses(cookie, sid);
  }

  function handleRepasteCookie() {
    clearCookie();
    clearCourses();
    lastFetchedCookie.current = "";
    scheduler.clearSchedules();
  }

  const canGenerate =
    courses.selectedCourses.length > 0 &&
    !courses.loadingCourseId &&
    !scheduler.generating &&
    courses.selectedCourses.some(
      (c) => (courses.includedSectionIds[c.id]?.size ?? 0) > 0,
    );

  const activeCourse =
    courses.selectedCourses.find((c) => c.id === activeCourseId) ?? null;

  const currentSchedule =
    scheduler.schedules.length > 0
      ? scheduler.schedules[scheduler.activeIndex]
      : null;

  const savedEntry = currentSchedule
    ? saved.saved.find((s) => {
        if (s.schedule.sections.length !== currentSchedule.sections.length)
          return false;
        const savedIds = new Set(s.schedule.sections.map((sec) => sec.id));
        return currentSchedule.sections.every((sec) => savedIds.has(sec.id));
      })
    : undefined;
  const isAlreadySaved = !!savedEntry;

  /* ── No cookie: landing (no chrome) ─────────────────────────── */
  if (!cookie) {
    return (
      <>
        {/* Minimal header on landing */}
        <header className="h-[52px] flex items-center justify-between px-6 border-b border-border shrink-0">
          <NavLogo />
          <NavRightIcons />
        </header>
        <CookieSetup onSave={setCookie} />
      </>
    );
  }

  /* ── App ─────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ════════════════════════════════════════════════════════
          Single unified header bar
      ════════════════════════════════════════════════════════ */}
      <header className="h-[52px] flex items-center gap-6 px-6 border-b border-border shrink-0 bg-background">
        <NavLogo />

        {/* Divider */}
        <span className="h-5 w-px bg-border" />

        {/* Page + tab links — all on one row */}
        <nav className="flex items-center gap-5">
          <NavTab active={tab === "courses"} onClick={() => setTab("courses")}>
            <LayoutGrid className="size-3.5" />
            Courses
            {courses.selectedCourses.length > 0 && (
              <NavBadge count={courses.selectedCourses.length} />
            )}
          </NavTab>

          <NavTab
            active={tab === "schedules"}
            onClick={() => setTab("schedules")}
          >
            <Calendar className="size-3.5" />
            Schedules
            {scheduler.schedules.length > 0 && (
              <NavBadge count={scheduler.schedules.length} muted />
            )}
          </NavTab>

          <NavLink href="/saved" active={false}>
            Saved
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {scheduler.generateError && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="size-3.5" />
              Too many combinations
            </span>
          )}

          {/* Generate */}
          <button
            onClick={() =>
              scheduler.generate(
                courses.selectedCourses,
                courses.includedSectionIds,
              )
            }
            disabled={!canGenerate}
            className={cn(
              "h-8 px-4 flex items-center gap-2 text-xs font-bold tracking-widest uppercase rounded transition-opacity",
              canGenerate
                ? "btn-primary-gradient text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {scheduler.generating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Zap className="size-3.5" />
            )}
            {scheduler.generating ? "Generating…" : "Generate"}
          </button>

          <NavRightIcons />
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          Tab content
      ════════════════════════════════════════════════════════ */}
      {tab === "courses" ? (
        <CoursesTab
          sessionId={sessionId}
          onSelectSession={selectSession}
          courses={courses}
          activeCourse={activeCourse}
          onActivateCourse={setActiveCourseId}
          cookie={cookie}
          onRepasteCookie={handleRepasteCookie}
          onClearSchedules={scheduler.clearSchedules}
        />
      ) : (
        <SchedulesTab
          schedules={scheduler.schedules}
          activeIndex={scheduler.activeIndex}
          generating={scheduler.generating}
          selectedCourses={courses.selectedCourses}
          isAlreadySaved={isAlreadySaved}
          onPrev={() =>
            scheduler.setActiveIndex(Math.max(0, scheduler.activeIndex - 1))
          }
          onNext={() =>
            scheduler.setActiveIndex(
              Math.min(
                scheduler.schedules.length - 1,
                scheduler.activeIndex + 1,
              ),
            )
          }
          onSave={() =>
            saved.saveCurrentSchedule(currentSchedule!, courses.selectedCourses)
          }
          onUnsave={() => savedEntry && saved.removeSaved(savedEntry.id)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COURSES TAB
═══════════════════════════════════════════════════════════════════ */
function CoursesTab({
  sessionId,
  onSelectSession,
  courses,
  activeCourse,
  onActivateCourse,
  cookie,
  onRepasteCookie,
  onClearSchedules,
}: {
  sessionId: string;
  onSelectSession: (sid: string) => void;
  courses: ReturnType<typeof useCourses>;
  activeCourse: Course | null;
  onActivateCourse: (id: string) => void;
  cookie: string;
  onRepasteCookie: () => void;
  onClearSchedules: () => void;
}) {
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* ── Left: compact course list ──────────────────────────── */}
      <aside className="w-52 shrink-0 flex flex-col bg-sidebar border-r border-border overflow-hidden">
        {/* Term selector */}
        <div className="flex gap-1.5 p-3 border-b border-border/60 shrink-0">
          {SESSIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={cn(
                "flex-1 py-1.5 text-xs font-semibold rounded transition-colors",
                sessionId === s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search / add course */}
        <CourseAddBar
          allCourses={courses.allCourses}
          coursesLoading={courses.coursesLoading}
          coursesError={courses.coursesError}
          loadingCourseId={courses.loadingCourseId}
          search={courses.search}
          dropdownOpen={courses.dropdownOpen}
          filtered={courses.filtered}
          courseAddError={courses.courseAddError}
          onAdd={(c) => courses.addCourse(c, cookie, sessionId)}
          onSearchChange={courses.setSearch}
          onDropdownChange={courses.setDropdownOpen}
          onRetry={() => courses.loadCourses(cookie, sessionId)}
          onRepasteCookie={onRepasteCookie}
        />

        {/* Course chip list — fix: outer is a div, remove button is inside */}
        <div className="flex-1 overflow-y-auto min-h-0 py-1">
          {courses.selectedCourses.length === 0 ? (
            <p className="px-4 py-6 text-xs text-muted-foreground text-center">
              Search and add courses above.
            </p>
          ) : (
            courses.selectedCourses.map((course) => {
              const included = courses.includedSectionIds[course.id]?.size ?? 0;
              const isActive = activeCourse?.id === course.id;
              return (
                /* ── No button-in-button: outer is a div ── */
                <div
                  key={course.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onActivateCourse(course.id)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    onActivateCourse(course.id)
                  }
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors group select-none",
                    isActive
                      ? "bg-accent text-foreground"
                      : "hover:bg-accent/60 text-foreground",
                  )}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: course.color }}
                  />
                  <span className="flex-1 min-w-0 text-xs font-semibold truncate">
                    {course.code}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 tabular-nums">
                    {included}/{course.sections.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      courses.removeCourse(course.id, onClearSchedules);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive transition-all shrink-0"
                    aria-label={`Remove ${course.code}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Change cookie */}
        <div className="shrink-0 p-3 border-t border-border/60">
          <button
            onClick={onRepasteCookie}
            className="w-full text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            Change cookie
          </button>
        </div>
      </aside>

      {/* ── Right: section table ────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeCourse ? (
          <SectionTable
            course={activeCourse}
            includedIds={
              courses.includedSectionIds[activeCourse.id] ?? new Set()
            }
            onToggleSection={(sid) =>
              courses.toggleSection(activeCourse.id, sid, onClearSchedules)
            }
            onToggleAll={(include) =>
              courses.toggleAllSections(
                activeCourse.id,
                include,
                onClearSchedules,
              )
            }
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            {courses.selectedCourses.length === 0
              ? "Search and add a course to get started."
              : "Select a course from the list to see its sections."}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Course add bar ─────────────────────────────────────────────── */
function CourseAddBar({
  allCourses,
  coursesLoading,
  coursesError,
  loadingCourseId,
  search,
  dropdownOpen,
  filtered,
  courseAddError,
  onAdd,
  onSearchChange,
  onDropdownChange,
  onRetry,
  onRepasteCookie,
}: {
  allCourses: ApiCourse[];
  coursesLoading: boolean;
  coursesError: string;
  loadingCourseId: string | null;
  search: string;
  dropdownOpen: boolean;
  filtered: ApiCourse[];
  courseAddError: string;
  onAdd: (c: ApiCourse) => void;
  onSearchChange: (v: string) => void;
  onDropdownChange: (v: boolean) => void;
  onRetry: () => void;
  onRepasteCookie: () => void;
}) {
  const isCookieError =
    coursesError.toLowerCase().includes("cookie") ||
    coursesError.toLowerCase().includes("expired") ||
    coursesError.toLowerCase().includes("401");

  return (
    <div className="relative px-3 py-2 border-b border-border/60 shrink-0">
      <div className="relative flex items-center">
        {coursesLoading || loadingCourseId ? (
          <Loader2 className="absolute left-2.5 size-3.5 animate-spin text-muted-foreground pointer-events-none" />
        ) : (
          <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
        )}
        <input
          type="text"
          className="w-full h-8 pl-8 pr-3 rounded bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          placeholder={coursesLoading ? "Loading…" : "Search courses…"}
          value={search}
          disabled={coursesLoading}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onDropdownChange(true);
          }}
          onFocus={() => search && onDropdownChange(true)}
          onKeyDown={(e) => e.key === "Escape" && onDropdownChange(false)}
        />
        {search && (
          <button
            type="button"
            className="absolute right-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => {
              onSearchChange("");
              onDropdownChange(false);
            }}
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {dropdownOpen && search.trim() && (
        <div className="absolute left-3 right-3 top-full z-20 mt-0.5 rounded border border-border bg-popover shadow-[0_8px_24px_rgba(0,0,0,0.3)] max-h-52 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.slice(0, 12).map((c, i) => (
              <button
                key={`${c.COURSE_CREATION_ID}-${i}`}
                type="button"
                className="w-full px-3 py-2 text-left text-xs hover:bg-accent transition-colors text-foreground"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onAdd(c)}
              >
                {c.COURSE_NAME}
              </button>
            ))
          ) : (
            <p className="px-3 py-2.5 text-xs text-muted-foreground">
              No match for &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Errors */}
      {coursesError && (
        <div className="mt-2 text-xs text-destructive space-y-1">
          <p className="font-semibold flex items-center gap-1">
            <AlertCircle className="size-3 shrink-0" />
            {isCookieError ? "Session expired." : "Failed to load."}
          </p>
          <div className="flex gap-2 pl-4">
            {isCookieError ? (
              <button
                type="button"
                onClick={onRepasteCookie}
                className="underline underline-offset-2 hover:opacity-70"
              >
                Re-paste cookie
              </button>
            ) : (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1 underline underline-offset-2 hover:opacity-70"
              >
                <RefreshCw className="size-3" /> Retry
              </button>
            )}
          </div>
        </div>
      )}
      {courseAddError && (
        <p className="mt-1 text-[10px] text-destructive">{courseAddError}</p>
      )}
    </div>
  );
}

/* ── Section table ──────────────────────────────────────────────── */
function SectionTable({
  course,
  includedIds,
  onToggleSection,
  onToggleAll,
}: {
  course: Course;
  includedIds: Set<string>;
  onToggleSection: (sectionId: string) => void;
  onToggleAll: (include: boolean) => void;
}) {
  const allOn = includedIds.size === course.sections.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-4 px-5 py-3 border-b border-border bg-background/60">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: course.color }}
          />
          <div className="min-w-0">
            <span className="text-sm font-bold text-foreground truncate block">
              {course.code}
            </span>
            <span className="text-[10px] text-muted-foreground truncate block">
              {course.name}
            </span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {includedIds.size} of {course.sections.length} selected
        </span>
        <button
          type="button"
          onClick={() => onToggleAll(!allOn)}
          className="ml-auto text-xs font-semibold text-primary hover:opacity-70 transition-opacity"
        >
          {allOn ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* Column headers */}
      <div className="shrink-0 grid grid-cols-[2.5rem_7rem_1fr_1fr_1fr_1fr_6rem] gap-x-4 px-5 py-2 border-b border-border bg-muted/30 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
        <div />
        <div>Section</div>
        <div>Professor</div>
        <div>Schedule</div>
        <div>Room</div>
        <div>Days</div>
        <div className="text-right">Capacity</div>
      </div>

      {/* Rows */}
      {course.sections.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          No sections for this term.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {course.sections.map((section) => (
            <SectionTableRow
              key={section.id}
              section={section}
              included={includedIds.has(section.id)}
              color={course.color}
              onToggle={() => onToggleSection(section.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Section table row ──────────────────────────────────────────── */
function SectionTableRow({
  section,
  included,
  color,
  onToggle,
}: {
  section: Section;
  included: boolean;
  color: string;
  onToggle: () => void;
}) {
  const slots = section.capacity - section.enlisted;
  const full = slots <= 0;
  const pct =
    section.capacity > 0
      ? Math.round((section.enlisted / section.capacity) * 100)
      : 0;
  const sport = isPECourse(section.code)
    ? getPESport(section.code, section.section)
    : undefined;

  const groups = groupMeetings(section.meetings);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full grid grid-cols-[2.5rem_7rem_1fr_1fr_1fr_1fr_6rem] gap-x-4 items-start px-5 py-3",
        "border-b border-border/40 text-left transition-colors group",
        included
          ? "bg-background hover:bg-accent/40"
          : "hover:bg-accent/30 opacity-60",
      )}
    >
      <span
        className={cn(
          "size-5 rounded flex items-center justify-center border-2 transition-all shrink-0 mt-0.5",
          included
            ? "border-transparent"
            : "border-border group-hover:border-muted-foreground/60",
        )}
        style={included ? { backgroundColor: color, borderColor: color } : {}}
      >
        {included && <Check className="size-3 text-white stroke-[3]" />}
      </span>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-foreground">{section.section}</span>
        {sport && (
          <span className="text-[10px] font-semibold text-primary/70 truncate">{sport}</span>
        )}
      </div>

      <span className="text-sm text-muted-foreground truncate">
        {section.professor || "TBA"}
      </span>

      {/* Schedule — time only, one line per group */}
      <div className="text-xs text-muted-foreground font-mono">
        {groups.length === 0 ? <span>TBA</span> : groups.map((g, i) => (
          <div key={i} className="leading-snug whitespace-nowrap">{fmtTime(g.start)}–{fmtTime(g.end)}</div>
        ))}
      </div>

      {/* Room */}
      <div className="text-xs text-muted-foreground">
        {groups.length === 0 ? <span>—</span> : groups.map((g, i) => (
          <div key={i} className="leading-snug">{g.room || <span className="opacity-30">—</span>}</div>
        ))}
      </div>

      {/* Days — DLSU codes e.g. M/H, T/F */}
      <div className="text-xs font-semibold text-foreground">
        {groups.length === 0 ? <span className="text-muted-foreground">—</span> : groups.map((g, i) => (
          <div key={i} className="leading-snug">{g.days}</div>
        ))}
      </div>

      <div className="flex justify-end">
        <span
          className={cn(
            "text-[11px] font-semibold px-2 py-0.5 rounded",
            full
              ? "bg-destructive/15 text-destructive"
              : pct >= 80
                ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                : "bg-[var(--tertiary-bg)] text-[var(--tertiary)]",
          )}
        >
          {full ? "Full" : `${slots} open`}
        </span>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCHEDULES TAB
═══════════════════════════════════════════════════════════════════ */
function SchedulesTab({
  schedules,
  activeIndex,
  generating,
  selectedCourses,
  isAlreadySaved,
  onPrev,
  onNext,
  onSave,
  onUnsave,
}: {
  schedules: ReturnType<typeof useScheduler>["schedules"];
  activeIndex: number;
  generating: boolean;
  selectedCourses: Course[];
  isAlreadySaved: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
  onUnsave: () => void;
}) {
  const hasSchedules = schedules.length > 0;
  const active = schedules[activeIndex];

  if (!hasSchedules) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center select-none pointer-events-none px-8 py-16">
        <p
          className="font-[family-name:var(--font-outfit)] font-black leading-none text-foreground/[0.04]"
          style={{
            fontSize: "clamp(4rem,14vw,10rem)",
            letterSpacing: "-0.04em",
          }}
        >
          GENERATE
        </p>
        <p className="mt-6 text-sm text-muted-foreground pointer-events-auto text-center max-w-xs">
          {generating
            ? "Computing combinations…"
            : selectedCourses.length === 0
              ? "Add courses in the Courses tab, then hit Generate."
              : "Hit Generate to find conflict-free combinations."}
        </p>
        {generating && (
          <Loader2 className="mt-3 size-4 animate-spin text-muted-foreground pointer-events-auto" />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Nav bar */}
      <div className="shrink-0 flex items-center gap-2 px-5 py-3 border-b border-border bg-background/60">
        <button
          type="button"
          onClick={onPrev}
          disabled={activeIndex === 0}
          className="size-8 flex items-center justify-center rounded hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="size-5 text-muted-foreground" />
        </button>

        <span className="text-sm font-medium tabular-nums min-w-[9rem] text-center">
          Schedule{" "}
          <span className="font-bold text-primary">{activeIndex + 1}</span> of{" "}
          <span className="font-bold">{schedules.length}</span>
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={activeIndex === schedules.length - 1}
          className="size-8 flex items-center justify-center rounded hover:bg-accent disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="size-5 text-muted-foreground" />
        </button>

        <div className="ml-auto">
          {isAlreadySaved ? (
            <button
              type="button"
              onClick={onUnsave}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded border border-transparent hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-colors text-[var(--tertiary)]"
            >
              <BookmarkCheck className="size-3.5" />
              Saved
            </button>
          ) : (
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <Bookmark className="size-3.5" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-5 space-y-4">
        <div className="rounded-lg overflow-hidden border border-border bg-card">
          <ScheduleGrid schedule={active} courses={selectedCourses} />
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {active.sections.map((s) => {
            const course = selectedCourses.find((c) => c.code === s.code);
            return (
              <div
                key={`${s.id}-${s.code}`}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span
                  className="size-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: course?.color }}
                />
                <span className="font-semibold text-foreground">
                  {s.code} {s.section}
                </span>
                <span>
                  — {s.professor || "TBA"} · {meetingSummary(s.meetings)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
