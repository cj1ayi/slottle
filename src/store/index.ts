import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { get, set, del } from "idb-keyval"
import { createCourseSlice, type CourseSlice } from "./courseSlice"
import { createScheduleSlice, type ScheduleSlice } from "./scheduleSlice"
import { createUISlice, type UISlice } from "./uiSlice"

export type GlobalStore = CourseSlice & ScheduleSlice & UISlice

export const useStore = create<GlobalStore>()(
  persist(
    (...a) => ({
      ...createCourseSlice(...a),
      ...createScheduleSlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: "slottle-store",
      storage: createJSONStorage(() => ({
        getItem: async (key) => (await get(key)) ?? null,
        setItem: async (key, value) => await set(key, value),
        removeItem: async (key) => await del(key),
      })),
      skipHydration: true,
    }
  )
)
