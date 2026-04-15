import type { StateCreator } from "zustand";
import type { Course } from "@/types";
import type { GlobalStore } from "./types";

export type CourseSlice = {
  courses: Course[];
  // stored as string[] for JSON/IDB compat — converted to Set<string> in useCourses
  includedSectionIds: Record<string, string[]>;

  addCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
  updateCourse: (id: string, updated: Partial<Course>) => void;
  clearCourses: () => void;
  setIncludedSectionIds: (ids: Record<string, string[]>) => void;
};

export const createCourseSlice: StateCreator<
  GlobalStore,
  [],
  [],
  CourseSlice
> = (set) => ({
  courses: [],
  includedSectionIds: {},

  addCourse: (course) =>
    set((state) => ({ courses: [...state.courses, course] })),
  removeCourse: (id) =>
    set((state) => {
      const { [id]: _removed, ...rest } = state.includedSectionIds;
      return {
        courses: state.courses.filter((c) => c.id !== id),
        includedSectionIds: rest,
      };
    }),
  updateCourse: (id, updated) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.id === id ? { ...c, ...updated } : c,
      ),
    })),
  clearCourses: () => set({ courses: [], includedSectionIds: {} }),
  setIncludedSectionIds: (ids) => set({ includedSectionIds: ids }),
});
