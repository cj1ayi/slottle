"use client"

import { useCallback, useState } from "react"
import { buildCourse } from "@/lib/parser"
import { courseService } from "../services/courseService"
import type { ApiCourse } from "@/lib/schema"
import type { Course } from "@/types"

type UseCourses = {
  // state
  allCourses: ApiCourse[]
  coursesLoading: boolean
  coursesError: string
  selectedCourses: Course[]
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
}

export function useCourses(): UseCourses {
  const [allCourses, setAllCourses] = useState<ApiCourse[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [coursesError, setCoursesError] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([])
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null)
  const [includedSectionIds, setIncludedSectionIds] = useState<Record<string, Set<string>>>({})
  const [search, setSearch] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const selectedIds = new Set(selectedCourses.map((c) => c.id))

  const filtered = search.trim()
    ? allCourses.filter(
        (c) =>
          !selectedIds.has(String(c.COURSE_CREATION_ID)) &&
          c.COURSE_NAME.toLowerCase().includes(search.toLowerCase())
      )
    : []

  const loadCourses = useCallback((cookie: string, sessionId: string) => {
    setAllCourses([])
    setSelectedCourses([])
    setIncludedSectionIds({})
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
    try {
      const sections = await courseService.getSections(cookie, sessionId, courseId)
      const course = buildCourse(apiCourse, sections, selectedCourses.length)
      setSelectedCourses((prev) => [...prev, course])
      // Default: all sections included
      setIncludedSectionIds((prev) => ({
        ...prev,
        [course.id]: new Set(course.sections.map((s) => s.id)),
      }))
    } catch {
      // silent
    } finally {
      setLoadingCourseId(null)
    }
  }, [selectedIds, loadingCourseId, selectedCourses.length])

  const removeCourse = useCallback((id: string, clearSchedules: () => void) => {
    setSelectedCourses((prev) => prev.filter((c) => c.id !== id))
    setIncludedSectionIds((prev) => { const n = { ...prev }; delete n[id]; return n })
    clearSchedules()
  }, [])

  const toggleSection = useCallback((courseId: string, sectionId: string, clearSchedules: () => void) => {
    setIncludedSectionIds((prev) => {
      const current = new Set(prev[courseId] ?? [])
      if (current.has(sectionId)) current.delete(sectionId)
      else current.add(sectionId)
      return { ...prev, [courseId]: current }
    })
    clearSchedules()
  }, [])

  const toggleAllSections = useCallback((courseId: string, include: boolean, clearSchedules: () => void) => {
    const course = selectedCourses.find((c) => c.id === courseId)
    if (!course) return
    setIncludedSectionIds((prev) => ({
      ...prev,
      [courseId]: include ? new Set(course.sections.map((s) => s.id)) : new Set(),
    }))
    clearSchedules()
  }, [selectedCourses])

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
    clearCoursesError: () => setCoursesError(""),
  }
}
