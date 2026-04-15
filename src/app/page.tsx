"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search, Filter, AlertTriangle, Plus } from "lucide-react";
import { useStore } from "@/store";
import { CookieSetup } from "@/features/auth/components/CookieSetup";
import { CourseSearch } from "@/features/courses/components/CourseSearch";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { ScheduleViewer } from "@/features/scheduler/components/ScheduleViewer";
import { useScheduler } from "@/features/scheduler/hooks/useScheduler";
import { useSaved } from "@/features/saved/hooks/useSaved";
import { cn } from "@/lib/utils";

const SESSIONS = [
  { id: "135", label: "AY 2025-2026 Term 3" },
  { id: "4", label: "AY 2025-2026 Term 2" },
];

export default function Home() {
  const cookie = useStore((s) => s.cookie);
  const setCookie = useStore((s) => s.setCookie);
  const clearCookie = useStore((s) => s.clearCookie);

  const [hydrated, setHydrated] = useState(false);
  const [sessionId, setSessionId] = useState("135");

  const courses = useCourses();
  const scheduler = useScheduler();
  const saved = useSaved();

  const lastFetchedCookie = useRef("");

  useEffect(() => {
    const result = useStore.persist.rehydrate();
    Promise.resolve(result).then(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated || !cookie || lastFetchedCookie.current === cookie) return;
    lastFetchedCookie.current = cookie;
    courses.loadCourses(cookie, sessionId);
    // biome-ignore lint/correctness/useExhaustiveDependencies: loadCourses is stable via useCallback
  }, [hydrated, cookie]);

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  function selectSession(sid: string) {
    setSessionId(sid);
    courses.loadCourses(cookie, sid);
  }

  function handleRepasteCookie() {
    clearCookie();
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

  /* ── No cookie: full landing layout ─────────────────────────── */
  if (!cookie) {
    return (
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <SidebarShell>
          <SidebarNav active={null} />
          <SidebarStatus connected={false} />
        </SidebarShell>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <CookieSetup onSave={setCookie} />
        </main>
      </div>
    );
  }

  /* ── Cookie set: scheduler layout ───────────────────────────── */
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Sidebar */}
      <SidebarShell>
        {/* Session picker */}
        <div className="px-4 pb-3 flex gap-1.5">
          {SESSIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSession(s.id)}
              className={cn(
                "flex-1 py-1 text-[10px] font-semibold tracking-wide uppercase rounded-sm transition-colors",
                sessionId === s.id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.id === "135" ? "Term 3" : "Term 2"}
            </button>
          ))}
        </div>

        {/* Course search + stack */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <CourseSearch
            allCourses={courses.allCourses}
            coursesLoading={courses.coursesLoading}
            coursesError={courses.coursesError}
            courseAddError={courses.courseAddError}
            selectedCourses={courses.selectedCourses}
            loadingCourseId={courses.loadingCourseId}
            includedSectionIds={courses.includedSectionIds}
            search={courses.search}
            dropdownOpen={courses.dropdownOpen}
            filtered={courses.filtered}
            onAddCourse={(c) => courses.addCourse(c, cookie, sessionId)}
            onRemoveCourse={(id) =>
              courses.removeCourse(id, scheduler.clearSchedules)
            }
            onToggleSection={(cid, sid) =>
              courses.toggleSection(cid, sid, scheduler.clearSchedules)
            }
            onToggleAll={(cid, include) =>
              courses.toggleAllSections(cid, include, scheduler.clearSchedules)
            }
            onSearchChange={courses.setSearch}
            onDropdownChange={courses.setDropdownOpen}
            onRetry={() => courses.loadCourses(cookie, sessionId)}
            onRepasteCookie={handleRepasteCookie}
          />

          {/* Nav items below stack */}
          <div className="mt-2 border-t border-border/40">
            <SidebarNav active="search" />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/40 p-4">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-semibold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="size-3" />
            Add Manual Entry
          </button>
        </div>

        <SidebarStatus connected={true} />
      </SidebarShell>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <ScheduleViewer
          schedules={scheduler.schedules}
          activeIndex={scheduler.activeIndex}
          generating={scheduler.generating}
          generateError={scheduler.generateError}
          truncated={scheduler.truncated}
          canGenerate={canGenerate}
          selectedCourses={courses.selectedCourses}
          onGenerate={() =>
            scheduler.generate(
              courses.selectedCourses,
              courses.includedSectionIds,
            )
          }
          onSave={() =>
            saved.saveCurrentSchedule(
              scheduler.schedules[scheduler.activeIndex],
              courses.selectedCourses,
            )
          }
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
        />
      </main>
    </div>
  );
}

/* ─── Shared sidebar shell ──────────────────────────────────────── */
function SidebarShell({ children }: { children: React.ReactNode }) {
  return (
    <aside className="w-[280px] shrink-0 flex flex-col overflow-hidden bg-sidebar">
      {/* Header */}
      <div className="px-5 py-5 shrink-0">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
          Selection Engine
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          Precision Course Engineering
        </p>
      </div>
      {children}
    </aside>
  );
}

/* ─── Sidebar nav items ─────────────────────────────────────────── */
function SidebarNav({ active }: { active: "search" | "filters" | "conflicts" | null }) {
  return (
    <nav className="px-3 space-y-0.5 py-2">
      <SidebarItem
        icon={<Search className="size-4" />}
        label="Course Search"
        active={active === "search"}
      />
      <SidebarItem
        icon={<Filter className="size-4" />}
        label="Filters"
        active={active === "filters"}
      />
      <SidebarItem
        icon={<AlertTriangle className="size-4" />}
        label="Conflicts"
        active={active === "conflicts"}
      />
    </nav>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors",
        active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/* ─── Engine status footer ──────────────────────────────────────── */
function SidebarStatus({ connected }: { connected: boolean }) {
  return (
    <div className="shrink-0 px-5 py-4 border-t border-border/40">
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
        Engine Status
      </p>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "size-2 rounded-full shrink-0",
            connected ? "bg-[oklch(0.75_0.14_185)]" : "bg-destructive",
          )}
        />
        <span className="text-xs text-muted-foreground">
          {connected ? "Engine connected" : "Waiting for connection..."}
        </span>
      </div>
    </div>
  );
}
