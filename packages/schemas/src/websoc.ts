import { type Infer, arrayOf, type } from "arktype";

import { type Quarter, quarters } from "../types/constants";
import enumerate from "./enumerate";

export const WebsocSectionMeeting = type({
  days: "string",
  time: "string",
  bldg: "string[]",
});

export const WebsocSectionEnrollment = type({
  totalEnrolled: "string",
  sectionEnrolled: "string",
});

export const WebsocSection = type({
  sectionCode: "string",
  sectionType: "string",
  sectionNum: "string",
  units: "string",
  instructors: "string[]",
  meetings: arrayOf(WebsocSectionMeeting),
  finalExam: "string",
  maxCapacity: "string",
  numCurrentlyEnrolled: WebsocSectionEnrollment,
  numOnWaitlist: "string",
  numWaitlistCap: "string",
  numRequested: "string",
  numNewOnlyReserved: "string",
  restrictions: "string",
  status: enumerate(["OPEN", "Waitl", "FULL", "NewOnly"] as const),
  sectionComment: "string",
});

export const WebsocCourse = type({
  deptCode: "string",
  courseNumber: "string",
  courseTitle: "string",
  courseComment: "string",
  prerequisiteLink: "string",
  sections: arrayOf(WebsocSection),
});

export const WebsocDepartment = type({
  deptName: "string",
  deptCode: "string",
  deptComment: "string",
  courses: arrayOf(WebsocCourse),
  sectionCodeRangeComments: "string[]",
  courseNumberRangeComments: "string[]",
});

export const WebsocSchool = type({
  schoolName: "string",
  schoolComment: "string",
  departments: arrayOf(WebsocDepartment),
});

export const Term = type({
  year: "string",
  quarter: enumerate(quarters),
});

export const WebsocAPIResponse = {
  schools: arrayOf(WebsocSchool),
};

export const Department = type({
  deptLabel: "string",
  deptValue: "string",
});

export const DepartmentResponse = arrayOf(Department);

export const TermData = type({
  shortName: "string" as Infer<`${string} ${Quarter}`>,
  longName: "string",
});

export const TermResponse = arrayOf(TermData);
