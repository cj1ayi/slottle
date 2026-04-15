import type { StateCreator } from "zustand";
import type { Schedule, UserSchedule } from "@/types";
import type { GlobalStore } from "./types";

export type ScheduleSlice = {
  // Persisted
  saved: UserSchedule[];
  saveSchedule: (userSchedule: UserSchedule) => void;
  renameSaved: (id: string, name: string) => void;
  removeSaved: (id: string) => void;
  // In-memory only (excluded from IDB via partialize)
  generated: Schedule[];
  activeScheduleIndex: number;
  setGenerated: (schedules: Schedule[]) => void;
  setActiveScheduleIndex: (index: number) => void;
  clearGenerated: () => void;
};

export const createScheduleSlice: StateCreator<
  GlobalStore,
  [],
  [],
  ScheduleSlice
> = (set) => ({
  saved: [],
  saveSchedule: (userSchedule) =>
    set((state) => ({ saved: [...state.saved, userSchedule] })),
  renameSaved: (id, name) =>
    set((state) => ({
      saved: state.saved.map((s) => (s.id === id ? { ...s, name } : s)),
    })),
  removeSaved: (id) =>
    set((state) => ({ saved: state.saved.filter((s) => s.id !== id) })),
  generated: [],
  activeScheduleIndex: 0,
  setGenerated: (schedules) => set({ generated: schedules, activeScheduleIndex: 0 }),
  setActiveScheduleIndex: (index) => set({ activeScheduleIndex: index }),
  clearGenerated: () => set({ generated: [], activeScheduleIndex: 0 }),
});
