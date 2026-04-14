import type { StateCreator } from "zustand";
import type { UserSchedule } from "@/types";
import type { GlobalStore } from "./types";

export type ScheduleSlice = {
  saved: UserSchedule[];
  saveSchedule: (userSchedule: UserSchedule) => void;
  renameSaved: (id: string, name: string) => void;
  removeSaved: (id: string) => void;
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
});
