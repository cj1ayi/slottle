import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Meeting } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtTime(t: number): string {
  const h = Math.floor(t / 100)
  const m = t % 100
  const ampm = h >= 12 ? "PM" : "AM"
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${display}:${String(m).padStart(2, "0")} ${ampm}`
}

export function meetingSummary(meetings: Meeting[]): string {
  if (meetings.length === 0) return "TBA"
  return meetings.map((m) => `${m.day} ${fmtTime(m.start)}–${fmtTime(m.end)}`).join(" · ")
}
