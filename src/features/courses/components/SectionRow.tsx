"use client"

import { Check } from "lucide-react"
import { meetingSummary } from "@/lib/utils"
import type { Section } from "@/types"

type Props = {
  section: Section
  included: boolean
  onToggle: () => void
  color: string
}

export function SectionRow({ section, included, onToggle, color }: Props) {
  const slots = section.capacity - section.enlisted
  const full = slots <= 0

  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 ${
        included ? "" : "opacity-40"
      }`}
    >
      {/* Checkbox */}
      <span
        className={`mt-0.5 size-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          included ? "border-transparent" : "border-input bg-background"
        }`}
        style={included ? { backgroundColor: color } : {}}
      >
        {included && <Check className="size-2.5 text-white" />}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm font-medium">{section.section}</span>
          <span className="text-xs text-muted-foreground truncate">{section.professor || "TBA"}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{meetingSummary(section.meetings)}</p>
      </div>

      {/* Slots */}
      <span className={`text-xs shrink-0 mt-0.5 tabular-nums ${full ? "text-destructive" : "text-muted-foreground"}`}>
        {full ? "FULL" : `${slots} slots`}
      </span>
    </button>
  )
}
