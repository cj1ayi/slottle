import type { CourseSlice } from "./courseSlice"
import type { ScheduleSlice } from "./scheduleSlice"
import type { UISlice } from "./uiSlice"

export type GlobalStore = CourseSlice & ScheduleSlice & UISlice
