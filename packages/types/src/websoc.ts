import { type } from "arktype";

export const websocSectionMeeting = type({
    days: "string",
    time: "string",
    bldg: "string[]",
});

export const websocSectionEnrollment = type({
    totalEnrolled: "string",
    sectionEnrolled: "string",
});

export const AASection = type({
    sectionCode: "string",
    sectionType: "string",
    sectionNum: "string",
    units: "string",
    instructors: "string[]",
    meetings: websocSectionMeeting,
    finalExam: "string",
    maxCapacity: "string",
    numCurrentlyEnrolled: websocSectionEnrollment,
    numOnWaitlist: "string",
    numWaitlistCap: "string",
    numRequested: "string",
    numNewOnlyReserved: "string",
    restrictions: "string",
    status: "'OPEN'|'Waitl'|'FULL'|'NewOnly'",
    sectionComment: "string",
    color: "string"
});

// export const websocCourse = type({
//     deptCode: "string",
//     courseNumber: "string",
//     courseTitle: "string",
//     courseComment: "string",
//     prerequisiteLink: "string",
//     sections: websocSection,
// });
//
// export const websocDepartment = type({
//     deptName: "string",
//     deptCode: "string",
//     deptComment: "string",
//     courses: websocCourse,
//     sectionCodeRangeComments: "string[]",
//     courseNumberRangeComments: "string[]",
// });
//
// export const websocSchool = type({
//     schoolName: "string",
//     schoolComment: "string",
//     departments: websocDepartment,
// });

// export const term = type({
//     year: "string",
//     quarter: "'Fall'|'Winter'|'Spring'|'Summer'",
// });
//
// export const websocAPIResponse = type({
//     schools: websocSchool,
// });
//
// export const department = type({
//     deptLabel: "string",
//     deptValue: "string",
// });
//
// export const departmentResponse = type([department]);
//
// export const termData = type({
//     shortName: "string",
//     longName: "string",
// });
//
// export const termResponse = type([termData]);
