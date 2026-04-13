import { z } from "zod"

export const daySchema = z.enum([
  "M","T","W",
  "Th","F","S",
])

export const modalitySchema = z.enum([
  "F2F", "Online", "Hybrid"
])

export const meetingSchema  = z.object({
  day: daySchema,
  start: z.number().min(600).max(2200),
  end: z.number().min(600).max(2200),
  room: z.string(),
  modality: modalitySchema,
}).refine((tb) => tb.start < tb.end, {
  message: "Start time must be before end time",
})

export const sectionSchema = z.object({
  id: z.string(),
  code: z.string(),
  section: z.string(),
  professor: z.string(),
  meetings: z.array(meetingSchema).min(1),
  locked: z.boolean(),
  capacity: z.number(),
  enlisted: z.number(),
})

export const courseSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  units: z.number(),
  sections: z.array(sectionSchema),
  color: z.string(),
})

export const scheduleSchema = z.object({
  id: z.string(),
  sections: z.array(sectionSchema),
})

export const userScheduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  schedules: z.array(scheduleSchema),
  activeIndex: z.number().min(0),
  createdAt: z.number(),
})

export const apiCourseSchema = z.object({
  COURSE_CREATION_ID: z.number(),
  COURSE_NAME: z.string(),
})

export const apiSectionSchema = z.object({
  COURSE_CREATION_ID: z.number(),
  SECTION_CREATION_ID: z.number(),
  SECTION_NAME: z.string(),
  SUBJECT_NAME: z.string(),
  CREDITS: z.number(),
  MAIN_TEACHER: z.string(),
  SCHEDULE: z.string(),
  SESSION: z.string(),
  CAPACITY: z.number(),
  ENLISTED: z.number().default(0),
})

export type ApiCourse = z.infer<typeof apiCourseSchema>
export type ApiSection = z.infer<typeof apiSectionSchema>
