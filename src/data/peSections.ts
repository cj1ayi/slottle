export interface PESection {
  courseCode: string; // e.g. "PETHREE", "PEDFOUR"
  section: string; // e.g. "Z11"
  sport: string; // e.g. "Pickleball"
  professor: string;
  days: string[]; // e.g. ["F"]
  startTime: string; // e.g. "8:00 AM"
  endTime: string; // e.g. "10:00 AM"
}

// Term 3 AY 2025-2026 parsed from official PE course offerings announcement
export const peSections: PESection[] = [
  // ── PETHREE ──────────────────────────────────────────────────────────────

  // Monday
  { courseCode: "PETHREE", section: "Y01", sport: "Social Dance",  professor: "De Luna, Roselyn Reyes",             days: ["M"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Y02", sport: "Social Dance",  professor: "Olarte, Christopher Pogoy",          days: ["M"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Y03", sport: "Social Dance",  professor: "De Luna, Roselyn Reyes",             days: ["M"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Y04", sport: "Pickleball",    professor: "Olarte, Christopher Pogoy",          days: ["M"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PETHREE", section: "Y05", sport: "Swimming",      professor: "Acibar, Merlie Tatad",               days: ["M"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PETHREE", section: "Y06", sport: "Social Dance",  professor: "De Luna, Roselyn Reyes",             days: ["M"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PETHREE", section: "B91", sport: "Pickleball",    professor: "Olarte, Christopher Pogoy",          days: ["M"], startTime: "3:30 PM",  endTime: "5:30 PM"},

  // Tuesday
  { courseCode: "PETHREE", section: "Y07", sport: "Social Dance",  professor: "De Luna, Roselyn Reyes",             days: ["T"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Y08", sport: "Pickleball",    professor: "Olarte, Christopher Pogoy",          days: ["T"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PETHREE", section: "Y09", sport: "Pickleball",    professor: "Olarte, Christopher Pogoy",          days: ["T"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PETHREE", section: "Y10", sport: "Swimming",      professor: "Acibar, Merlie Tatad",               days: ["T"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PETHREE", section: "Y11", sport: "Social Dance",  professor: "De Luna, Roselyn Reyes",             days: ["T"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PETHREE", section: "Y12", sport: "Social Dance",  professor: "De Luna, Roselyn Reyes",             days: ["T"], startTime: "6:00 PM",  endTime: "8:00 PM"},
  { courseCode: "PETHREE", section: "Y19", sport: "Archery",       professor: "Samson, Marijoy Regala",             days: ["T"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Y20", sport: "Archery",       professor: "Samson, Marijoy Regala",             days: ["T"], startTime: "10:00 AM", endTime: "12:00 PM"},

  // Wednesday
  { courseCode: "PETHREE", section: "Y13", sport: "Swimming",      professor: "Del Rosario, Jhomel Eugenio",        days: ["W"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Y14", sport: "Archery",       professor: "Samson, Marijoy Regala",             days: ["W"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Y15", sport: "Social Dance",  professor: "Cordova, Ma. Socorro Gigi Villamor", days: ["W"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Y16", sport: "Swimming",      professor: "Del Rosario, Jhomel Eugenio",        days: ["W"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Y17", sport: "Archery",       professor: "Samson, Marijoy Regala",             days: ["W"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Y18", sport: "Social Dance",  professor: "Cordova, Ma. Socorro Gigi Villamor", days: ["W"], startTime: "10:00 AM", endTime: "12:00 PM"},

  // Thursday (H in PDF → Th)
  { courseCode: "PETHREE", section: "Z01", sport: "Swimming",      professor: "Aguinaldo, Jerrwin Calixto",         days: ["Th"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Z02", sport: "Archery",       professor: "Samson, Marijoy Regala",             days: ["Th"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Z03", sport: "Pickleball",    professor: "Olarte, Christopher Pogoy",          days: ["Th"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Z04", sport: "Archery",       professor: "Samson, Marijoy Regala",             days: ["Th"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Z05", sport: "Social Dance",  professor: "De Luna, Roselyn Reyes",             days: ["Th"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Z06", sport: "Swimming",      professor: "Aguinaldo, Jerrwin Calixto",         days: ["Th"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PETHREE", section: "Z07", sport: "Pickleball",    professor: "Panlilio, Rolando Mendoza",          days: ["Th"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PETHREE", section: "Z08", sport: "Swimming",      professor: "De Luna, Roselyn Reyes",             days: ["Th"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PETHREE", section: "Z09", sport: "Social Dance",  professor: "Tapang, Margarita Velarde",          days: ["Th"], startTime: "6:00 PM",  endTime: "8:00 PM"},
  { courseCode: "PETHREE", section: "Z10", sport: "Social Dance",  professor: "De Luna, Roselyn Reyes",             days: ["Th"], startTime: "6:00 PM",  endTime: "8:00 PM"},

  // Friday
  { courseCode: "PETHREE", section: "Z11", sport: "Spikeball",     professor: "De Luna, Roselyn Reyes",             days: ["F"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Z12", sport: "Swimming",      professor: "Bautista, Letecia Callejas",         days: ["F"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Z13", sport: "Social Dance",  professor: "Cordova, Ma. Socorro Gigi Villamor", days: ["F"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Z14", sport: "Spikeball",     professor: "De Luna, Roselyn Reyes",             days: ["F"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Z15", sport: "Social Dance",  professor: "Cordova, Ma. Socorro Gigi Villamor", days: ["F"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Z16", sport: "Social Dance",  professor: "Olarte, Christopher Pogoy",          days: ["F"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PETHREE", section: "Z17", sport: "Pickleball",    professor: "Aguinaldo, Jerrwin Calixto",         days: ["F"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PETHREE", section: "Z18", sport: "Swimming",      professor: "Acibar, Merlie Tatad",               days: ["F"], startTime: "3:30 PM",  endTime: "5:30 PM"},

  // Saturday
  { courseCode: "PETHREE", section: "Z19", sport: "Pickleball",    professor: "Mendizabal, Bengie Pranada",         days: ["S"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Z20", sport: "Social Dance",  professor: "Cordova, Ma. Socorro Gigi Villamor", days: ["S"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PETHREE", section: "Z21", sport: "Pickleball",    professor: "Mendizabal, Bengie Pranada",         days: ["S"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Z22", sport: "Swimming",      professor: "Santiago, Rosalinda Barandino",      days: ["S"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Z23", sport: "Social Dance",  professor: "Cordova, Ma. Socorro Gigi Villamor", days: ["S"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PETHREE", section: "Z24", sport: "Pickleball",    professor: "Quesada, Almario Lalu",              days: ["S"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PETHREE", section: "Z25", sport: "Swimming",      professor: "Santiago, Rosalinda Barandino",      days: ["S"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PETHREE", section: "Z26", sport: "Pickleball",    professor: "Quesada, Almario Lalu",              days: ["S"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PETHREE", section: "Z27", sport: "Swimming",      professor: "Santiago, Rosalinda Barandino",      days: ["S"], startTime: "3:30 PM",  endTime: "5:30 PM"},

  // ── PEDFOUR ──────────────────────────────────────────────────────────────

  // Monday
  { courseCode: "PEDFOUR", section: "Y01", sport: "Ultimate Disc",  professor: "Panlilio, Rolando Mendoza",          days: ["M"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PEDFOUR", section: "Y02", sport: "Ultimate Disc",  professor: "Rodriguez, Carol Bergonia",          days: ["M"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PEDFOUR", section: "Y03", sport: "Waboba",         professor: "Acibar, Merlie Tatad",               days: ["M"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PEDFOUR", section: "Y04", sport: "Ultimate Disc",  professor: "Panlilio, Rolando Mendoza",          days: ["M"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Y05", sport: "Waboba",         professor: "Acibar, Merlie Tatad",               days: ["M"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Y06", sport: "Dance",          professor: "Rodriguez, Carol Bergonia",          days: ["M"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Y07", sport: "Ultimate Disc",  professor: "Rodriguez, Carol Bergonia",          days: ["M"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PEDFOUR", section: "Y08", sport: "3x3 Basketball", professor: "Cabreros, Anthony Del Castillo",     days: ["M"], startTime: "6:00 PM",  endTime: "8:00 PM"},

  // Tuesday
  { courseCode: "PEDFOUR", section: "Y09", sport: "Handball",       professor: "Balagan, Jon Francis",               days: ["T"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PEDFOUR", section: "Y10", sport: "Ultimate Disc",  professor: "Panlilio, Rolando Mendoza",          days: ["T"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PEDFOUR", section: "Y11", sport: "Ultimate Disc",  professor: "Rodriguez, Carol Bergonia",          days: ["T"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PEDFOUR", section: "Y12", sport: "Waboba",         professor: "Acibar, Merlie Tatad",               days: ["T"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PEDFOUR", section: "Y13", sport: "Ultimate Disc",  professor: "Panlilio, Rolando Mendoza",          days: ["T"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Y14", sport: "Waboba",         professor: "Acibar, Merlie Tatad",               days: ["T"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Y15", sport: "Dance",          professor: "Balagan, Jon Francis",               days: ["T"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Y16", sport: "Ultimate Disc",  professor: "Rodriguez, Carol Bergonia",          days: ["T"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PEDFOUR", section: "Y17", sport: "Dance",          professor: "Balagan, Jon Francis",               days: ["T"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PEDFOUR", section: "Y18", sport: "3x3 Basketball", professor: "Oña, Darwin Ryan Dinao",             days: ["T"], startTime: "6:00 PM",  endTime: "8:00 PM"},
  { courseCode: "PEDFOUR", section: "Y20", sport: "Dance",          professor: "Poquiz, Ma. Luisa Dizon",            days: ["T"], startTime: "1:00 PM",  endTime: "3:00 PM"},

  // Wednesday
  { courseCode: "PEDFOUR", section: "Y19", sport: "Handball",       professor: "Balagan, Jon Francis",               days: ["W"], startTime: "8:00 AM",  endTime: "10:00 AM"},

  // Thursday
  { courseCode: "PEDFOUR", section: "Z01", sport: "Handball",       professor: "Balagan, Jon Francis",               days: ["Th"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PEDFOUR", section: "Z02", sport: "Ultimate Disc",  professor: "Panlilio, Rolando Mendoza",          days: ["Th"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PEDFOUR", section: "Z03", sport: "Ultimate Disc",  professor: "Rodriguez, Carol Bergonia",          days: ["Th"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PEDFOUR", section: "Z04", sport: "Handball",       professor: "Balagan, Jon Francis",               days: ["Th"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Z05", sport: "Ultimate Disc",  professor: "Panlilio, Rolando Mendoza",          days: ["Th"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Z06", sport: "Handball",       professor: "Balagan, Jon Francis",               days: ["Th"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PEDFOUR", section: "Z07", sport: "3x3 Basketball", professor: "Oña, Darwin Ryan Dinao",             days: ["Th"], startTime: "6:00 PM",  endTime: "8:00 PM"},

  // Friday
  { courseCode: "PEDFOUR", section: "Z08", sport: "Ultimate Disc",  professor: "Rodriguez, Carol Bergonia",          days: ["F"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PEDFOUR", section: "Z09", sport: "Flippaball",     professor: "Bautista, Letecia Callejas",         days: ["F"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PEDFOUR", section: "Z10", sport: "Ultimate Disc",  professor: "Rodriguez, Carol Bergonia",          days: ["F"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Z11", sport: "Flippaball",     professor: "Bautista, Letecia Callejas",         days: ["F"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Z12", sport: "Dance",          professor: "Poquiz, Ma. Luisa Dizon",            days: ["F"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Z13", sport: "Handball",       professor: "Balagan, Jon Francis",               days: ["F"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PEDFOUR", section: "Z14", sport: "Dance",          professor: "Rodriguez, Carol Bergonia",          days: ["F"], startTime: "3:30 PM",  endTime: "5:30 PM"},
  { courseCode: "PEDFOUR", section: "Z15", sport: "Handball",       professor: "Balagan, Jon Francis",               days: ["F"], startTime: "6:00 PM",  endTime: "8:00 PM"},

  // Saturday
  { courseCode: "PEDFOUR", section: "Z16", sport: "Ultimate Disc",  professor: "Del Rosario, Jhomel Eugenio",        days: ["S"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PEDFOUR", section: "Z17", sport: "Waboba",         professor: "Quesada, Almario Lalu",              days: ["S"], startTime: "8:00 AM",  endTime: "10:00 AM"},
  { courseCode: "PEDFOUR", section: "Z18", sport: "Handball",       professor: "Balagan, Jon Francis",               days: ["S"], startTime: "10:00 AM", endTime: "12:00 PM"},
  { courseCode: "PEDFOUR", section: "Z19", sport: "Ultimate Disc",  professor: "Torres, Ryan Batac",                 days: ["S"], startTime: "1:00 PM",  endTime: "3:00 PM"},
  { courseCode: "PEDFOUR", section: "Z20", sport: "Ultimate Disc",  professor: "Torres, Ryan Batac",                 days: ["S"], startTime: "3:30 PM",  endTime: "5:30 PM"},
];

const PE_COURSE_CODES = new Set(["PETHREE", "PEDFOUR", "PE1CRDO", "PE2FTEX"]);

export function isPECourse(courseCode: string): boolean {
  return courseCode.startsWith("PE") || PE_COURSE_CODES.has(courseCode);
}

/** Returns the sport name for a given course code + section, or undefined if not found.
 *  courseCode may be the full API name e.g. "PETHREE - INDIVIDUAL AND DUAL SPORTS…",
 *  so we match by startsWith against the short code stored in peSections. */
export function getPESport(courseCode: string, section: string): string | undefined {
  return peSections.find(
    (pe) => courseCode.startsWith(pe.courseCode) && pe.section === section,
  )?.sport;
}
