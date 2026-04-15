"use client"

import { useCallback, useMemo, useState } from "react"
import { buildCourse, applyRoomData } from "@/lib/parser"
import { courseService } from "../services/courseService"
import { useStore } from "@/store"
import type { ApiCourse } from "@/lib/schema"

type UseCourses = {
  // state
  allCourses: ApiCourse[]
  coursesLoading: boolean
  coursesError: string
  courseAddError: string
  selectedCourses: ReturnType<typeof useStore.getState>["courses"]
  loadingCourseId: string | null
  includedSectionIds: Record<string, Set<string>>
  search: string
  dropdownOpen: boolean
  filtered: ApiCourse[]
  // actions
  loadCourses: (cookie: string, sessionId: string) => void
  addCourse: (apiCourse: ApiCourse, cookie: string, sessionId: string) => Promise<void>
  removeCourse: (id: string, clearSchedules: () => void) => void
  toggleSection: (courseId: string, sectionId: string, clearSchedules: () => void) => void
  toggleAllSections: (courseId: string, include: boolean, clearSchedules: () => void) => void
  setSearch: (value: string) => void
  setDropdownOpen: (open: boolean) => void
  clearCoursesError: () => void
  clearCourseAddError: () => void
}

export function useCourses(): UseCourses {
  // ── Zustand (survives navigation) ─────────────────────────────
  const selectedCourses = useStore((s) => s.courses)
  const storedIncluded = useStore((s) => s.includedSectionIds)
  const storeAddCourse = useStore((s) => s.addCourse)
  const storeRemoveCourse = useStore((s) => s.removeCourse)
  const storeClearCourses = useStore((s) => s.clearCourses)
  const storeSetIncluded = useStore((s) => s.setIncludedSectionIds)

  // Convert stored string[] back to Set<string> for component usage
  const includedSectionIds = useMemo<Record<string, Set<string>>>(
    () =>
      Object.fromEntries(
        Object.entries(storedIncluded).map(([k, v]) => [k, new Set(v)]),
      ),
    [storedIncluded],
  )

  // ── Local state (transient — OK to lose on navigation) ────────
  const [allCourses, setAllCourses] = useState<ApiCourse[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [coursesError, setCoursesError] = useState("")
  const [courseAddError, setCourseAddError] = useState("")
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const selectedIds = useMemo(
    () => new Set(selectedCourses.map((c) => c.id)),
    [selectedCourses],
  )

  const filtered = search.trim()
    ? allCourses.filter(
        (c) =>
          !selectedIds.has(String(c.COURSE_CREATION_ID)) &&
          c.COURSE_NAME.toLowerCase().includes(search.toLowerCase()),
      )
    : []

  // Fetch available course catalog for this term — does NOT clear selected courses
  const loadCourses = useCallback((cookie: string, sessionId: string) => {
    setAllCourses([])
    setCoursesLoading(true)
    setCoursesError("")
    courseService
      .getCourses(cookie, sessionId)
      .then((data) => { setAllCourses(data); setCoursesLoading(false) })
      .catch((err: Error) => { setCoursesError(err.message); setCoursesLoading(false) })
  }, [])

  const addCourse = useCallback(async (apiCourse: ApiCourse, cookie: string, sessionId: string) => {
    const courseId = String(apiCourse.COURSE_CREATION_ID)
    if (selectedIds.has(courseId) || loadingCourseId) return
    setSearch("")
    setDropdownOpen(false)
    setLoadingCourseId(courseId)
    setCourseAddError("")
    try {
      const sections = await courseService.getSections(cookie, sessionId, courseId)
      let course = buildCourse(apiCourse, sections, selectedCourses.length)

      const roomData = await courseService.getRoomData(
        cookie,
        sessionId,
        courseId,
        sections.map((s) => String(s.SECTION_CREATION_ID)),
      )
      course = applyRoomData(course, roomData)

      storeAddCourse(course)
      // Default: all sections included
      storeSetIncluded({
        ...storedIncluded,
        [course.id]: course.sections.map((s) => s.id),
      })
    } catch (err) {
      setCourseAddError(err instanceof Error ? err.message : "Failed to load course sections")
    } finally {
      setLoadingCourseId(null)
    }
  }, [selectedIds, loadingCourseId, selectedCourses.length, storedIncluded, storeAddCourse, storeSetIncluded])

  const removeCourse = useCallback((id: string, clearSchedules: () => void) => {
    storeRemoveCourse(id)
    clearSchedules()
  }, [storeRemoveCourse])

  const toggleSection = useCallback((courseId: string, sectionId: string, clearSchedules: () => void) => {
    const current = new Set(storedIncluded[courseId] ?? [])
    if (current.has(sectionId)) current.delete(sectionId)
    else current.add(sectionId)
    storeSetIncluded({ ...storedIncluded, [courseId]: [...current] })
    clearSchedules()
  }, [storedIncluded, storeSetIncluded])

  const toggleAllSections = useCallback((courseId: string, include: boolean, clearSchedules: () => void) => {
    const course = selectedCourses.find((c) => c.id === courseId)
    if (!course) return
    storeSetIncluded({
      ...storedIncluded,
      [courseId]: include ? course.sections.map((s) => s.id) : [],
    })
    clearSchedules()
  }, [selectedCourses, storedIncluded, storeSetIncluded])

  return {
    allCourses,
    coursesLoading,
    coursesError,
    selectedCourses,
    loadingCourseId,
    includedSectionIds,
    search,
    dropdownOpen,
    filtered,
    loadCourses,
    addCourse,
    removeCourse,
    toggleSection,
    toggleAllSections,
    setSearch,
    setDropdownOpen,
    courseAddError,
    clearCoursesError: () => setCoursesError(""),
    clearCourseAddError: () => setCourseAddError(""),
  }
}
