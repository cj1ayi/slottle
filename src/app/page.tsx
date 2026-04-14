"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { useStore } from "@/store"
import { CookieSetup } from "@/features/auth/components/CookieSetup"
import { CourseSearch } from "@/features/courses/components/CourseSearch"
import { useCourses } from "@/features/courses/hooks/useCourses"
import { ScheduleViewer } from "@/features/scheduler/components/ScheduleViewer"
import { useScheduler } from "@/features/scheduler/hooks/useScheduler"
import { SavedList } from "@/features/saved/components/SavedList"
import { useSaved } from "@/features/saved/hooks/useSaved"

const SESSIONS = [
  { id: "135", label: "AY 2025-2026 Term 3" },
  { id: "4",   label: "AY 2025-2026 Term 2" },
]

export default function Home() {
  const cookie = useStore((s) => s.cookie)
  const setCookie = useStore((s) => s.setCookie)
  const clearCookie = useStore((s) => s.clearCookie)

  const [hydrated, setHydrated] = useState(false)
  const [sessionId, setSessionId] = useState("135")

  const courses = useCourses()
  const scheduler = useScheduler()
  const saved = useSaved()

  const lastFetchedCookie = useRef("")

  // Hydrate store
  useEffect(() => {
    const result = useStore.persist.rehydrate()
    Promise.resolve(result).then(() => setHydrated(true))
  }, [])

  // Auto-fetch courses when cookie changes
  useEffect(() => {
    if (!hydrated || !cookie || lastFetchedCookie.current === cookie) return
    lastFetchedCookie.current = cookie
    courses.loadCourses(cookie, sessionId)
  // biome-ignore lint/correctness/useExhaustiveDependencies: loadCourses is stable via useCallback, intentionally only re-fetch on cookie change
  }, [hydrated, cookie])

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!cookie) return <CookieSetup onSave={setCookie} />

  function selectSession(sid: string) {
    setSessionId(sid)
    courses.loadCourses(cookie, sid)
  }

  function handleRepasteCookie() {
    clearCookie()
    lastFetchedCookie.current = ""
    scheduler.clearSchedules()
  }

  const canGenerate =
    courses.selectedCourses.length > 0 &&
    !courses.loadingCourseId &&
    !scheduler.generating &&
    courses.selectedCourses.some((c) => (courses.includedSectionIds[c.id]?.size ?? 0) > 0)

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight">Slottle</span>
          <span className="text-muted-foreground text-sm hidden sm:block">— DLSU schedule generator</span>
        </div>
        <button
          onClick={handleRepasteCookie}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Change cookie
        </button>
      </header>

      <div className="flex flex-1 min-h-0 overflow-y-auto flex-col gap-6 p-6 max-w-5xl mx-auto w-full">

        {/* Term picker */}
        <section>
          <h2 className="text-sm font-semibold mb-2">Academic term</h2>
          <div className="flex flex-wrap gap-2">
            {SESSIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  sessionId === s.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* Course search + section picker */}
        <CourseSearch
          allCourses={courses.allCourses}
          coursesLoading={courses.coursesLoading}
          coursesError={courses.coursesError}
          selectedCourses={courses.selectedCourses}
          loadingCourseId={courses.loadingCourseId}
          includedSectionIds={courses.includedSectionIds}
          search={courses.search}
          dropdownOpen={courses.dropdownOpen}
          filtered={courses.filtered}
          onAddCourse={(c) => courses.addCourse(c, cookie, sessionId)}
          onRemoveCourse={(id) => courses.removeCourse(id, scheduler.clearSchedules)}
          onToggleSection={(cid, sid) => courses.toggleSection(cid, sid, scheduler.clearSchedules)}
          onToggleAll={(cid, include) => courses.toggleAllSections(cid, include, scheduler.clearSchedules)}
          onSearchChange={courses.setSearch}
          onDropdownChange={courses.setDropdownOpen}
          onRetry={() => courses.loadCourses(cookie, sessionId)}
          onRepasteCookie={handleRepasteCookie}
        />

        {/* Schedule generator + viewer */}
        <ScheduleViewer
          schedules={scheduler.schedules}
          activeIndex={scheduler.activeIndex}
          generating={scheduler.generating}
          canGenerate={canGenerate}
          selectedCourses={courses.selectedCourses}
          onGenerate={() => scheduler.generate(courses.selectedCourses, courses.includedSectionIds)}
          onSave={() => saved.saveCurrentSchedule(scheduler.schedules[scheduler.activeIndex], courses.selectedCourses)}
          onPrev={() => scheduler.setActiveIndex(Math.max(0, scheduler.activeIndex - 1))}
          onNext={() => scheduler.setActiveIndex(Math.min(scheduler.schedules.length - 1, scheduler.activeIndex + 1))}
        />

        {/* Saved schedules */}
        <SavedList
          saved={saved.saved}
          onRename={saved.renameSaved}
          onRemove={saved.removeSaved}
        />

      </div>
    </div>
  )
}
