"use client"

import { useEffect, useRef, useState } from "react"
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  X, Search, Loader2, AlertCircle, RefreshCw, Check, Bookmark, Pencil, Trash2,
} from "lucide-react"
import { useStore } from "@/store"
import { buildCourse } from "@/lib/parser"
import { generateSchedules } from "@/lib/scheduler"
import { ScheduleGrid } from "@/components/ScheduleGrid"
import type { ApiCourse, ApiSection } from "@/lib/schema"
import type { Course, Schedule, Section, Meeting, UserSchedule, SavedCourse } from "@/types"

// Known DLSU academic sessions
const SESSIONS = [
  { id: "135", label: "AY 2025-2026 Term 3" },
  { id: "4",   label: "AY 2025-2026 Term 2" },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTime(t: number): string {
  const h = Math.floor(t / 100)
  const m = t % 100
  const ampm = h >= 12 ? "PM" : "AM"
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${display}:${String(m).padStart(2, "0")} ${ampm}`
}

function meetingSummary(meetings: Meeting[]): string {
  if (meetings.length === 0) return "TBA"
  return meetings.map((m) => `${m.day} ${fmtTime(m.start)}–${fmtTime(m.end)}`).join(" · ")
}

// ─── Cookie setup ─────────────────────────────────────────────────────────────

function CookieSetup({ onSave }: { onSave: (cookie: string) => void }) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")

  function handle() {
    const trimmed = value.trim()
    if (!trimmed) { setError("Paste your session cookie first."); return }
    onSave(trimmed)
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Slottle</h1>
        <p className="text-muted-foreground mb-8">Schedule generator for DLSU Archers Hub</p>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div>
            <h2 className="font-semibold mb-1">Connect your Archers Hub session</h2>
            <p className="text-sm text-muted-foreground">
              Your cookie stays in your browser — never sent to our servers.
            </p>
          </div>

          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Log in to Archers Hub in another tab</li>
            <li>Open DevTools (F12) → <strong>Network</strong> tab</li>
            <li>Click any request to <code className="font-mono text-xs bg-muted px-1 rounded">archershub.dlsu.edu.ph</code></li>
            <li>Under <strong>Request Headers</strong>, copy the full <code className="font-mono text-xs bg-muted px-1 rounded">cookie:</code> value</li>
          </ol>

          <textarea
            className="w-full h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="cf_clearance=…; __RequestVerificationToken=…; __Secure-SID=…"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError("") }}
          />

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0" /> {error}
            </p>
          )}

          <button
            onClick={handle}
            className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section row ─────────────────────────────────────────────────────────────

function SectionRow({
  section,
  included,
  onToggle,
  color,
}: {
  section: Section
  included: boolean
  onToggle: () => void
  color: string
}) {
  const slots = section.capacity - section.enlisted
  const full = slots <= 0

  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 ${
        included ? "" : "opacity-40"
      }`}
    >
      {/* Checkbox */}
      <span
        className={`mt-0.5 size-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          included ? "border-transparent" : "border-input bg-background"
        }`}
        style={included ? { backgroundColor: color } : {}}
      >
        {included && <Check className="size-2.5 text-white" />}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-medium">{section.section}</span>
          <span className="text-xs text-muted-foreground truncate">{section.professor || "TBA"}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{meetingSummary(section.meetings)}</p>
      </div>

      {/* Slots */}
      <span className={`text-xs shrink-0 mt-0.5 tabular-nums ${full ? "text-destructive" : "text-muted-foreground"}`}>
        {full ? "FULL" : `${slots} slots`}
      </span>
    </button>
  )
}

// ─── Course card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  includedIds,
  onRemove,
  onToggleSection,
  onToggleAll,
}: {
  course: Course
  includedIds: Set<string>
  onRemove: () => void
  onToggleSection: (sectionId: string) => void
  onToggleAll: (include: boolean) => void
}) {
  const [open, setOpen] = useState(true)
  const includedCount = course.sections.filter((s) => includedIds.has(s.id)).length
  const allOn = includedCount === course.sections.length

  return (
    <li className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
        <button className="flex-1 min-w-0 text-left" onClick={() => setOpen((o) => !o)}>
          <p className="text-sm font-medium truncate">{course.name}</p>
          <p className="text-xs text-muted-foreground">
            {includedCount}/{course.sections.length} sections · {course.units} unit{course.units !== 1 ? "s" : ""}
          </p>
        </button>
        <button onClick={() => setOpen((o) => !o)} className="p-1 text-muted-foreground hover:text-foreground">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="size-3.5" />
        </button>
      </div>

      {/* Section list */}
      {open && (
        <div className="border-t border-border">
          {/* Select all / none */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-muted/30">
            <span className="text-xs text-muted-foreground">Sections</span>
            <button
              onClick={() => onToggleAll(!allOn)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              {allOn ? "Deselect all" : "Select all"}
            </button>
          </div>
          {course.sections.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No sections found for this term.</p>
          ) : (
            course.sections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                included={includedIds.has(section.id)}
                onToggle={() => onToggleSection(section.id)}
                color={course.color}
              />
            ))
          )}
        </div>
      )}
    </li>
  )
}

// ─── Saved schedule card ──────────────────────────────────────────────────────

function SavedScheduleCard({
  entry,
  onRename,
  onRemove,
}: {
  entry: UserSchedule
  onRename: (name: string) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(entry.name)

  function commitRename() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== entry.name) onRename(trimmed)
    else setDraft(entry.name)
    setEditing(false)
  }

  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: "short", day: "numeric",
  })

  return (
    <li className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button onClick={() => setOpen((o) => !o)} className="p-1 text-muted-foreground hover:text-foreground">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        {editing ? (
          <input
            autoFocus
            className="flex-1 min-w-0 text-sm font-medium bg-transparent border-b border-ring focus:outline-none"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename()
              if (e.key === "Escape") { setDraft(entry.name); setEditing(false) }
            }}
          />
        ) : (
          <button
            className="flex-1 min-w-0 text-left"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="text-sm font-medium truncate block">{entry.name}</span>
          </button>
        )}

        <span className="text-xs text-muted-foreground shrink-0">{date}</span>
        <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground hover:text-foreground">
          <Pencil className="size-3.5" />
        </button>
        <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-destructive">
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border">
          <div className="p-3">
            <ScheduleGrid
              schedule={entry.schedule}
              courses={entry.courses as Course[]}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-3">
            {entry.schedule.sections.map((s) => {
              const course = entry.courses.find((c) => c.code === s.code)
              return (
                <div key={s.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: course?.color }} />
                  <span className="font-medium text-foreground">{s.code} {s.section}</span>
                  <span>— {s.professor || "TBA"} · {meetingSummary(s.meetings)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </li>
  )
}

// ─── Main app ─────────────────────────────────────────────────────────────────

export default function Home() {
  const cookie = useStore((s) => s.cookie)
  const setCookie = useStore((s) => s.setCookie)
  const clearCookie = useStore((s) => s.clearCookie)
  const saved = useStore((s) => s.saved)
  const saveSchedule = useStore((s) => s.saveSchedule)
  const renameSaved = useStore((s) => s.renameSaved)
  const removeSaved = useStore((s) => s.removeSaved)

  const [hydrated, setHydrated] = useState(false)
  const [sessionId, setSessionId] = useState("135")

  const [allCourses, setAllCourses] = useState<ApiCourse[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [coursesError, setCoursesError] = useState("")

  const [search, setSearch] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null)
  // Which section IDs are included per course
  const [includedSectionIds, setIncludedSectionIds] = useState<Record<string, Set<string>>>({})

  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [generating, setGenerating] = useState(false)

  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Hydrate store
  useEffect(() => {
    const result = useStore.persist.rehydrate()
    Promise.resolve(result).then(() => setHydrated(true))
  }, [])

  function fetchCourses(sid: string) {
    setAllCourses([])
    setSelectedCourses([])
    setIncludedSectionIds({})
    setSchedules([])
    setCoursesLoading(true)
    setCoursesError("")
    fetch("/api/courses", {
      headers: { "x-archers-cookie": cookie, "x-academic-session": sid },
    })
      .then(async (r) => {
        const body = await r.json()
        if (!r.ok) throw new Error(body.error + (body.detail ? ` — ${body.detail}` : ""))
        return body as ApiCourse[]
      })
      .then((data) => { setAllCourses(data); setCoursesLoading(false) })
      .catch((err: Error) => { setCoursesError(err.message); setCoursesLoading(false) })
  }

  // Track which cookie value we last fetched for, so that any new cookie
  // (including after "Change cookie") triggers a fresh load automatically.
  const lastFetchedCookie = useRef("")
  useEffect(() => {
    if (!hydrated || !cookie || lastFetchedCookie.current === cookie) return
    lastFetchedCookie.current = cookie
    fetchCourses(sessionId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, cookie])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current !== e.target
      ) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (!hydrated) {
    return <div className="flex flex-1 items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
  }
  if (!cookie) return <CookieSetup onSave={setCookie} />

  // ─── Actions ────────────────────────────────────────────────────────────────

  function selectSession(sid: string) {
    setSessionId(sid)
    fetchCourses(sid)
  }

  const selectedIds = new Set(selectedCourses.map((c) => c.id))
  const filtered = search.trim()
    ? allCourses.filter(
        (c) =>
          !selectedIds.has(String(c.COURSE_CREATION_ID)) &&
          c.COURSE_NAME.toLowerCase().includes(search.toLowerCase())
      )
    : []

  async function addCourse(apiCourse: ApiCourse) {
    const courseId = String(apiCourse.COURSE_CREATION_ID)
    if (selectedIds.has(courseId) || loadingCourseId) return
    setSearch("")
    setDropdownOpen(false)
    setLoadingCourseId(courseId)
    try {
      const r = await fetch(`/api/sections/${courseId}`, {
        headers: { "x-archers-cookie": cookie, "x-academic-session": sessionId },
      })
      const body = await r.json()
      if (!r.ok) throw new Error(body.error)
      const sections = body as ApiSection[]
      const course = buildCourse(apiCourse, sections, selectedCourses.length)
      setSelectedCourses((prev) => [...prev, course])
      // Default: all sections included
      setIncludedSectionIds((prev) => ({
        ...prev,
        [course.id]: new Set(course.sections.map((s) => s.id)),
      }))
      setSchedules([])
    } catch {
      // silent
    } finally {
      setLoadingCourseId(null)
    }
  }

  function removeCourse(id: string) {
    setSelectedCourses((prev) => prev.filter((c) => c.id !== id))
    setIncludedSectionIds((prev) => { const n = { ...prev }; delete n[id]; return n })
    setSchedules([])
    setActiveIndex(0)
  }

  function toggleSection(courseId: string, sectionId: string) {
    setIncludedSectionIds((prev) => {
      const current = new Set(prev[courseId] ?? [])
      if (current.has(sectionId)) current.delete(sectionId)
      else current.add(sectionId)
      return { ...prev, [courseId]: current }
    })
    setSchedules([])
  }

  function toggleAllSections(courseId: string, include: boolean) {
    const course = selectedCourses.find((c) => c.id === courseId)
    if (!course) return
    setIncludedSectionIds((prev) => ({
      ...prev,
      [courseId]: include ? new Set(course.sections.map((s) => s.id)) : new Set(),
    }))
    setSchedules([])
  }

  function generate() {
    // Build courses using only the user-selected sections
    const coursesForGen = selectedCourses
      .map((c) => ({
        ...c,
        sections: c.sections.filter((s) => includedSectionIds[c.id]?.has(s.id) ?? false),
      }))
      .filter((c) => c.sections.length > 0)

    if (coursesForGen.length === 0) return
    setGenerating(true)
    setTimeout(() => {
      setSchedules(generateSchedules(coursesForGen))
      setActiveIndex(0)
      setGenerating(false)
    }, 0)
  }

  function saveCurrentSchedule() {
    const schedule = schedules[activeIndex]
    if (!schedule) return
    const courses: SavedCourse[] = selectedCourses.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      color: c.color,
      units: c.units,
    }))
    const entry: UserSchedule = {
      id: crypto.randomUUID(),
      name: `Schedule ${saved.length + 1}`,
      schedule,
      courses,
      createdAt: Date.now(),
    }
    saveSchedule(entry)
  }

  const canGenerate =
    selectedCourses.length > 0 &&
    !loadingCourseId &&
    !generating &&
    selectedCourses.some((c) => (includedSectionIds[c.id]?.size ?? 0) > 0)

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight">Slottle</span>
          <span className="text-muted-foreground text-sm hidden sm:block">— DLSU schedule generator</span>
        </div>
        <button
          onClick={() => {
            clearCookie()
            setAllCourses([])
            setSelectedCourses([])
            setSchedules([])
            setCoursesError("")
            lastFetchedCookie.current = ""
          }}
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

        {/* Course search */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Add courses</h2>
            <span className="text-xs text-muted-foreground">
              {coursesLoading ? "Loading…" : coursesError ? "Error" : `${allCourses.length} courses`}
            </span>
          </div>

          {coursesError && (
            <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="size-4 shrink-0" /> Could not fetch courses.
                </div>
                <button onClick={() => fetchCourses(sessionId)} className="flex items-center gap-1 text-xs underline underline-offset-2">
                  <RefreshCw className="size-3" /> Retry
                </button>
              </div>
              <p className="font-mono text-xs break-all opacity-80">{coursesError}</p>
            </div>
          )}

          <div className="relative">
            <div className="relative flex items-center">
              {coursesLoading || loadingCourseId ? (
                <Loader2 className="absolute left-3 size-4 animate-spin text-muted-foreground" />
              ) : (
                <Search className="absolute left-3 size-4 text-muted-foreground" />
              )}
              <input
                ref={searchRef}
                type="text"
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                placeholder={
                  coursesLoading ? "Loading courses…" :
                  allCourses.length === 0 ? "No courses loaded" :
                  `Search ${allCourses.length} courses…`
                }
                value={search}
                disabled={coursesLoading}
                onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true) }}
                onFocus={() => search && setDropdownOpen(true)}
                onKeyDown={(e) => e.key === "Escape" && setDropdownOpen(false)}
              />
            </div>

            {dropdownOpen && search.trim() && (
              <div
                ref={dropdownRef}
                className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-md max-h-64 overflow-y-auto"
              >
                {filtered.length > 0 ? (
                  filtered.slice(0, 12).map((c, i) => (
                    <button
                      // Use compound key — API can return duplicate COURSE_CREATION_IDs
                      key={`${c.COURSE_CREATION_ID}-${i}`}
                      className="w-full px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addCourse(c)}
                    >
                      {c.COURSE_NAME}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2.5 text-sm text-muted-foreground">
                    No courses match &ldquo;{search}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Selected courses with section pickers */}
          {selectedCourses.length > 0 && (
            <ul className="mt-3 space-y-2">
              {selectedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  includedIds={includedSectionIds[course.id] ?? new Set()}
                  onRemove={() => removeCourse(course.id)}
                  onToggleSection={(sid) => toggleSection(course.id, sid)}
                  onToggleAll={(include) => toggleAllSections(course.id, include)}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Generate */}
        <div className="flex items-center gap-4">
          <button
            onClick={generate}
            disabled={!canGenerate}
            className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating && <Loader2 className="size-4 animate-spin" />}
            Generate schedules
          </button>
          {schedules.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {schedules.length} valid combination{schedules.length !== 1 ? "s" : ""} found
            </p>
          )}
          {!generating && schedules.length === 0 && selectedCourses.length > 0 && canGenerate && (
            <p className="text-sm text-muted-foreground">No conflict-free combinations with selected sections.</p>
          )}
        </div>

        {/* Schedule viewer */}
        {schedules.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold">Schedule</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                  disabled={activeIndex === 0}
                  className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm tabular-nums min-w-[5rem] text-center text-muted-foreground">
                  {activeIndex + 1} / {schedules.length}
                </span>
                <button
                  onClick={() => setActiveIndex((i) => Math.min(schedules.length - 1, i + 1))}
                  disabled={activeIndex === schedules.length - 1}
                  className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <button
                onClick={saveCurrentSchedule}
                className="ml-auto flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
              >
                <Bookmark className="size-3.5" /> Save
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <ScheduleGrid schedule={schedules[activeIndex]} courses={selectedCourses} />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {schedules[activeIndex].sections.map((s) => {
                const course = selectedCourses.find((c) => c.code === s.code)
                return (
                  <div key={s.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: course?.color }} />
                    <span className="font-medium text-foreground">{s.code} {s.section}</span>
                    <span>— {s.professor || "TBA"} · {meetingSummary(s.meetings)}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Saved schedules */}
        {saved.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Saved schedules ({saved.length})</h2>
            <ul className="space-y-2">
              {saved.map((entry) => (
                <SavedScheduleCard
                  key={entry.id}
                  entry={entry}
                  onRename={(name) => renameSaved(entry.id, name)}
                  onRemove={() => removeSaved(entry.id)}
                />
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  )
}
