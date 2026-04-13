import type { StateCreator } from "zustand"
import type { GlobalStore } from "./types"

export type UISlice = {
  studentId: string
  zoomLevel: number
  setStudentId: (id: string) => void
  setZoomLevel: (level: number) => void
}

export const createUISlice: StateCreator<GlobalStore, [], [], UISlice> = (set) => ({
  studentId: "",
  zoomLevel: 1,
  setStudentId: (id) => set({ studentId: id }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
})
