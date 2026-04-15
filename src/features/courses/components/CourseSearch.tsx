"use client";

import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useRef } from "react";
import type { ApiCourse } from "@/lib/schema";
import type { Course } from "@/types";
import { CourseCard } from "./CourseCard";
import { cn } from "@/lib/utils";

type Props = {
  allCourses: ApiCourse[];
  coursesLoading: boolean;
  coursesError: string;
  courseAddError: string;
  selectedCourses: Course[];
  loadingCourseId: string | null;
  includedSectionIds: Record<string, Set<string>>;
  search: string;
  dropdownOpen: boolean;
  filtered: ApiCourse[];
  onAddCourse: (course: ApiCourse) => void;
  onRemoveCourse: (id: string) => void;
  onToggleSection: (courseId: string, sectionId: string) => void;
  onToggleAll: (courseId: string, include: boolean) => void;
  onSearchChange: (value: string) => void;
  onDropdownChange: (open: boolean) => void;
  onRetry: () => void;
  onRepasteCookie: () => void;
};

export function CourseSearch({
  allCourses,
  coursesLoading,
  coursesError,
  courseAddError,
  selectedCourses,
  loadingCourseId,
  includedSectionIds,
  search,
  dropdownOpen,
  filtered,
  onAddCourse,
  onRemoveCourse,
  onToggleSection,
  onToggleAll,
  onSearchChange,
  onDropdownChange,
  onRetry,
  onRepasteCookie,
}: Props) {
  const searchRef = useRef<HTMLInputElement>(null);

  const isCookieError =
    coursesError.toLowerCase().includes("cookie") ||
    coursesError.toLowerCase().includes("expired") ||
    coursesError.toLowerCase().includes("401");

  return (
    <div className="flex flex-col">
      {/* ── Search input ─────────────────────────── */}
      <div className="px-4 pb-3 relative">
        <div className="relative flex items-center">
          {coursesLoading || loadingCourseId ? (
            <Loader2 className="absolute left-3 size-3.5 animate-spin text-muted-foreground pointer-events-none" />
          ) : (
            <Search className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
          )}
          <input
            ref={searchRef}
            type="text"
            className={cn(
              "w-full h-9 pl-9 pr-8 rounded-sm bg-input text-sm text-foreground placeholder:text-muted-foreground/60",
              "border-0 border-b-2 border-b-transparent focus:border-b-primary",
              "focus:outline-none transition-colors",
              coursesLoading && "opacity-50 pointer-events-none",
            )}
            placeholder={
              coursesLoading
                ? "Loading courses…"
                : allCourses.length === 0
                  ? "No courses loaded"
                  : `CS 101, MATH 200…`
            }
            value={search}
            disabled={coursesLoading}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onDropdownChange(true);
            }}
            onFocus={() => search && onDropdownChange(true)}
            onKeyDown={(e) => e.key === "Escape" && onDropdownChange(false)}
          />
          {search && (
            <button
              className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => { onSearchChange(""); onDropdownChange(false); }}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {dropdownOpen && search.trim() && (
          <div className="absolute left-4 right-4 z-20 mt-1 rounded-sm border border-border/60 bg-popover shadow-[0_20px_40px_rgba(0,0,0,0.4)] max-h-56 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.slice(0, 12).map((c, i) => (
                <button
                  key={`${c.COURSE_CREATION_ID}-${i}`}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-accent transition-colors text-foreground"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onAddCourse(c)}
                >
                  {c.COURSE_NAME}
                </button>
              ))
            ) : (
              <p className="px-3 py-2.5 text-xs text-muted-foreground">
                No courses match &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Error banner ─────────────────────────── */}
      {coursesError && (
        <div className="mx-4 mb-3 rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs space-y-1.5">
          <div className="flex items-start gap-2 text-destructive">
            <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold">
                {isCookieError ? "Session expired." : "Could not fetch courses."}
              </p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                {isCookieError
                  ? "Re-paste your Archers Hub cookie."
                  : "Hub may be down or this term has no data."}
              </p>
            </div>
          </div>
          <div className="flex gap-3 pl-5">
            {isCookieError ? (
              <button
                onClick={onRepasteCookie}
                className="text-[11px] font-medium text-destructive underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Re-paste cookie
              </button>
            ) : (
              <>
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1 text-[11px] font-medium text-destructive underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  <RefreshCw className="size-3" /> Retry
                </button>
                <button
                  onClick={onRepasteCookie}
                  className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Re-paste cookie
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {courseAddError && (
        <p className="mx-4 mb-2 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" /> {courseAddError}
        </p>
      )}

      {/* ── Course stack ─────────────────────────── */}
      {selectedCourses.length > 0 && (
        <div className="px-4">
          {/* Stack header */}
          <div className="flex items-center justify-between mb-2 py-1">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
              Current Stack
            </span>
            <span className="text-[10px] font-bold tracking-wide text-primary">
              {selectedCourses.length} {selectedCourses.length === 1 ? "Course" : "Courses"}
            </span>
          </div>

          <ul className="space-y-2">
            {selectedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                includedIds={includedSectionIds[course.id] ?? new Set()}
                onRemove={() => onRemoveCourse(course.id)}
                onToggleSection={(sid) => onToggleSection(course.id, sid)}
                onToggleAll={(include) => onToggleAll(course.id, include)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
