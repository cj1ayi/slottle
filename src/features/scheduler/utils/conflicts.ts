import type { Meeting } from "@/types"

export function meetingsOverlap(a: Meeting, b: Meeting): boolean {
  if (a.day !== b.day)
    return false

  return a.start < b.end && b.start < a.end
}

export function sectionsConflict(a: Meeting[], b: Meeting[]): boolean {
  return a.some((ma) => b.some((mb) => meetingsOverlap(ma, mb)))
}

