import { describe, expect, test } from "bun:test"
import { meetingsOverlap, sectionsConflict } from "./conflicts"
import type { Meeting } from "@/types"

// ── Helpers ───────────────────────────────────────────────────────────────────

function meeting(day: Meeting["day"], start: number, end: number): Meeting {
  return { day, start, end, room: "TBA", modality: "F2F" }
}

// ── meetingsOverlap ───────────────────────────────────────────────────────────

describe("meetingsOverlap", () => {
  test("overlapping meetings on the same day", () => {
    expect(meetingsOverlap(meeting("M", 900, 1030), meeting("M", 1000, 1130))).toBe(true)
  })

  test("identical meetings conflict", () => {
    expect(meetingsOverlap(meeting("T", 900, 1030), meeting("T", 900, 1030))).toBe(true)
  })

  test("one meeting contained inside another", () => {
    expect(meetingsOverlap(meeting("W", 800, 1200), meeting("W", 900, 1000))).toBe(true)
  })

  test("back-to-back meetings do NOT conflict", () => {
    // 9:00-10:30 ends exactly when 10:30-12:00 starts — no overlap
    expect(meetingsOverlap(meeting("M", 900, 1030), meeting("M", 1030, 1200))).toBe(false)
  })

  test("non-overlapping meetings on the same day", () => {
    expect(meetingsOverlap(meeting("F", 700, 830), meeting("F", 1300, 1430))).toBe(false)
  })

  test("same time but different days do NOT conflict", () => {
    expect(meetingsOverlap(meeting("M", 900, 1030), meeting("T", 900, 1030))).toBe(false)
  })

  test("M vs Th are different days", () => {
    expect(meetingsOverlap(meeting("M", 900, 1030), meeting("Th", 900, 1030))).toBe(false)
  })

  test("T vs Th are different days", () => {
    expect(meetingsOverlap(meeting("T", 900, 1030), meeting("Th", 900, 1030))).toBe(false)
  })

  test("meeting that ends before another starts", () => {
    expect(meetingsOverlap(meeting("M", 700, 830), meeting("M", 900, 1030))).toBe(false)
  })

  test("meeting that starts after another ends", () => {
    expect(meetingsOverlap(meeting("M", 1300, 1430), meeting("M", 700, 830))).toBe(false)
  })
})

// ── sectionsConflict ──────────────────────────────────────────────────────────

describe("sectionsConflict", () => {
  test("single conflicting meeting", () => {
    const a = [meeting("M", 900, 1030)]
    const b = [meeting("M", 1000, 1130)]
    expect(sectionsConflict(a, b)).toBe(true)
  })

  test("no conflict — different days", () => {
    const a = [meeting("M", 900, 1030)]
    const b = [meeting("T", 900, 1030)]
    expect(sectionsConflict(a, b)).toBe(false)
  })

  test("no conflict — back-to-back same day", () => {
    const a = [meeting("M", 900, 1030)]
    const b = [meeting("M", 1030, 1200)]
    expect(sectionsConflict(a, b)).toBe(false)
  })

  test("multiple meetings — one pair conflicts", () => {
    // section a: Mon + Wed, section b: Tue + Wed (Wed overlaps)
    const a = [meeting("M", 900, 1030), meeting("W", 900, 1030)]
    const b = [meeting("T", 900, 1030), meeting("W", 1000, 1130)]
    expect(sectionsConflict(a, b)).toBe(true)
  })

  test("multiple meetings — no conflicts at all", () => {
    const a = [meeting("M", 900, 1030), meeting("W", 900, 1030)]
    const b = [meeting("T", 900, 1030), meeting("Th", 900, 1030)]
    expect(sectionsConflict(a, b)).toBe(false)
  })

  test("empty meeting lists do not conflict", () => {
    expect(sectionsConflict([], [])).toBe(false)
    expect(sectionsConflict([meeting("M", 900, 1030)], [])).toBe(false)
    expect(sectionsConflict([], [meeting("M", 900, 1030)])).toBe(false)
  })

  test("is symmetric — a vs b same as b vs a", () => {
    const a = [meeting("M", 900, 1030)]
    const b = [meeting("M", 1000, 1130)]
    expect(sectionsConflict(a, b)).toBe(sectionsConflict(b, a))
  })
})
