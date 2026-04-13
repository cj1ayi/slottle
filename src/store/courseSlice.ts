import { Course } from "@/types";

export type CourseSlice = {
  courses: Course[]
  addCourse: (course: Course) => void
  removeCourse: (id: string) => void
  updateCourse: (id: string, updated: Partial<Course>) => void
  clearCourses: () => void
}


export const createCourseSlice = (set: any): CourseSlice => ({
  courses: [],
  addCourse: (course) =>
    set((state: any) => ({ courses: [...state.courses, course] })),
  removeCourse: (id) =>
    set((state: any) => ({ courses: state.courses.filter((c: Course) => c.id !== id) })),
  updateCourse: (id, updated) =>
    set((state: any) => ({
      courses: state.courses.map((c: Course) => c.id === id ? { ...c, ...updated } : c),
    })),
  clearCourses: () => set({ courses: [] }),
})
