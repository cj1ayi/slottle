export type Day = "M" | "T" | "W" | "Th" | "F" | "S"


export type Meeting = {
  day: Day
  start: number // 24hr format 0900 for 9:00 am
  end: number // 24hr format 1500 for 3:00 pm
  room: string
  modality: "F2F" | "Online" | "Hybrid"
}

export type Section = {
  id: string
  code: string // CCAPDEV
  section: string // S22
  professor: string
  meetings: Meeting[]
  locked: boolean
  capacity: number
  enlisted: number
}

export type Course = {
  id: string
  code: string // CCAPDEV
  name: string // Web Application Development
  units: number
  sections: Section[]
  color: string // hex for calendar later i think ahh
}

export type Schedule = {
  id: string
  sections: Section[] 
}

export type SavedCourse = {
  id: string
  code: string
  name: string
  color: string
  units: number
}

export type UserSchedule = {
  id: string
  name: string
  schedule: Schedule
  courses: SavedCourse[]
  createdAt: number
}
