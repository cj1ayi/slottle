import type { StateCreator } from "zustand"
import type { Course } from "@/types"
import type { GlobalStore } from "./types"

export type CourseSlice = {
  courses: Course[]
  addCourse: (course: Course) => void
  removeCourse: (id: string) => void
  updateCourse: (id: string, updated: Partial<Course>) => void
  clearCourses: () => void
}

export const createCourseSlice: StateCreator<GlobalStore, [], [], CourseSlice> = (set) => ({
  courses: [],
  addCourse: (course) =>
    set((state) => ({ courses: [...state.courses, course] })),
  removeCourse: (id) =>
    set((state) => ({ courses: state.courses.filter((c) => c.id !== id) })),
  updateCourse: (id, updated) =>
    set((state) => ({
      courses: state.courses.map((c) => c.id === id ? { ...c, ...updated } : c),
    })),
  clearCourses: () => set({ courses: [] }),
})
