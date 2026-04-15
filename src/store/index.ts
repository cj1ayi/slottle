import { del, get, set } from "idb-keyval";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type CourseSlice, createCourseSlice } from "./courseSlice";
import { createScheduleSlice, type ScheduleSlice } from "./scheduleSlice";
import { createUISlice, type UISlice } from "./uiSlice";

export type GlobalStore = CourseSlice & ScheduleSlice & UISlice;

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
      partialize: (state) => {
        // Exclude transient scheduler state from IDB — it survives navigation
        // in-memory but resets on page reload (expected behaviour).
        const { generated, activeScheduleIndex, ...persisted } = state;
        return persisted;
      },
      skipHydration: true,
    },
  ),
);
