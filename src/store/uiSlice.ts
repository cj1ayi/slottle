import type { StateCreator } from "zustand";
import type { GlobalStore } from "./types";

export type UISlice = {
  cookie: string;
  zoomLevel: number;
  setCookie: (cookie: string) => void;
  clearCookie: () => void;
  setZoomLevel: (level: number) => void;
};

export const createUISlice: StateCreator<GlobalStore, [], [], UISlice> = (
  set,
) => ({
  cookie: "",
  zoomLevel: 1,
  setCookie: (cookie) => set({ cookie }),
  clearCookie: () => set({ cookie: "" }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
});
