import type { StateCreator } from "zustand"
import type { UserSchedule, Schedule } from "@/types"
import type { GlobalStore } from "./types"

export type ScheduleSlice = {
  generated: Schedule[]
  saved: UserSchedule[]
  activeScheduleId: string | null
  setGenerated: (schedules: Schedule[]) => void
  saveSchedule: (userSchedule: UserSchedule) => void
  removeSaved: (id: string) => void
  setActiveSchedule: (id: string | null) => void
  clearGenerated: () => void
}

export const createScheduleSlice: StateCreator<GlobalStore, [], [], ScheduleSlice> = (set) => ({
  generated: [],
  saved: [],
  activeScheduleId: null,
  setGenerated: (schedules) => set({ generated: schedules }),
  saveSchedule: (userSchedule) =>
    set((state) => ({ saved: [...state.saved, userSchedule] })),
  removeSaved: (id) =>
    set((state) => ({ saved: state.saved.filter((s) => s.id !== id) })),
  setActiveSchedule: (id) => set({ activeScheduleId: id }),
  clearGenerated: () => set({ generated: [] }),
})
