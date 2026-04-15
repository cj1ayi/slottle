"use client";

// SavedList is no longer rendered on the main page.
// Saved schedules are managed on /saved.

export function SavedList(_props: {
  saved: unknown[];
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  return null;
}
