import { expect, test } from "bun:test";
import type { Course } from "@/types";
import { generateSchedules } from "./generator";

const mockCourses: Course[] = [
  {
    id: "1",
    code: "CCPROG1",
    name: "Programming 1",
    units: 3,
    color: "#000",
    sections: [
      {
        id: "s1",
        code: "CCPROG1",
        section: "S11",
        professor: "Juan",
        locked: false,
        capacity: 30,
        enlisted: 20,
        meetings: [
          { day: "M", start: 900, end: 1030, room: "TBA", modality: "F2F" },
        ],
      },
      {
        id: "s2",
        code: "CCPROG1",
        section: "S12",
        professor: "Maria",
        locked: false,
        capacity: 30,
        enlisted: 20,
        meetings: [
          { day: "T", start: 900, end: 1030, room: "TBA", modality: "F2F" },
        ],
      },
    ],
  },
  {
    id: "2",
    code: "CCMATH1",
    name: "Math 1",
    units: 3,
    color: "#fff",
    sections: [
      {
        id: "s3",
        code: "CCMATH1",
        section: "S11",
        professor: "Pedro",
        locked: false,
        capacity: 30,
        enlisted: 20,
        meetings: [
          { day: "M", start: 900, end: 1030, room: "TBA", modality: "F2F" },
        ],
      },
      {
        id: "s4",
        code: "CCMATH1",
        section: "S12",
        professor: "Rosa",
        locked: false,
        capacity: 30,
        enlisted: 20,
        meetings: [
          { day: "W", start: 900, end: 1030, room: "TBA", modality: "F2F" },
        ],
      },
    ],
  },
];

test("generates valid non-conflicting schedules", () => {
  const schedules = generateSchedules(mockCourses);
  expect(schedules.length).toBe(3); // s1+s4, s2+s3, s2+s4 (s1+s3 conflict on M 9-10:30)
});
