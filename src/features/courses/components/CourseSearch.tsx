"use client";

import { AlertCircle, Loader2, RefreshCw, Search } from "lucide-react";
import { useRef } from "react";
import type { ApiCourse } from "@/lib/schema";
import type { Course } from "@/types";
import { CourseCard } from "./CourseCard";

type Props = {
  // data
  allCourses: ApiCourse[];
  coursesLoading: boolean;
  coursesError: string;
  selectedCourses: Course[];
  loadingCourseId: string | null;
  includedSectionIds: Record<string, Set<string>>;
  search: string;
  dropdownOpen: boolean;
  filtered: ApiCourse[];
  // actions
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCookieError =
    coursesError.toLowerCase().includes("cookie") ||
    coursesError.toLowerCase().includes("expired") ||
    coursesError.toLowerCase().includes("401");

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Add courses</h2>
        <span className="text-xs text-muted-foreground">
          {coursesLoading
            ? "Loading…"
            : coursesError
              ? "Error"
              : `${allCourses.length} courses`}
        </span>
      </div>

      {coursesError && (
        <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm space-y-2">
          <div className="flex items-start gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {isCookieError
                  ? "Your session has expired."
                  : "Could not fetch courses."}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isCookieError
                  ? "Re-paste your Archers Hub cookie to continue."
                  : "The Hub may be down or this term has no data yet."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-6">
            {isCookieError ? (
              <button
                onClick={onRepasteCookie}
                className="text-xs font-medium text-destructive underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Re-paste cookie
              </button>
            ) : (
              <>
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1 text-xs font-medium text-destructive underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  <RefreshCw className="size-3" /> Retry
                </button>
                <button
                  onClick={onRepasteCookie}
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Re-paste cookie instead
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <div className="relative flex items-center">
          {coursesLoading || loadingCourseId ? (
            <Loader2 className="absolute left-3 size-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="absolute left-3 size-4 text-muted-foreground" />
          )}
          <input
            ref={searchRef}
            type="text"
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            placeholder={
              coursesLoading
                ? "Loading courses…"
                : allCourses.length === 0
                  ? "No courses loaded"
                  : `Search ${allCourses.length} courses…`
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
        </div>

        {dropdownOpen && search.trim() && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-md max-h-64 overflow-y-auto"
          >
            {filtered.length > 0 ? (
              filtered.slice(0, 12).map((c, i) => (
                <button
                  // Use compound key — API can return duplicate COURSE_CREATION_IDs
                  key={`${c.COURSE_CREATION_ID}-${i}`}
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onAddCourse(c)}
                >
                  {c.COURSE_NAME}
                </button>
              ))
            ) : (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">
                No courses match &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {selectedCourses.length > 0 && (
        <ul className="mt-3 space-y-2">
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
      )}
    </section>
  );
}
