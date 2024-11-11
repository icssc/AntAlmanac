import { type Infer, arrayOf, type, union } from 'arktype';
import { type Quarter, quarters } from 'peterportal-api-next-types';
import enumerate from './enumerate';

export const HourMinute = type({
    hour: 'number',
    minute: 'number',
});

export const WebsocSectionMeeting = type({
    timeIsTBA: 'boolean',
    bldg: 'string[]',
    days: 'string | null',
    startTime: union(HourMinute, 'null'),
    endTime: union(HourMinute, 'null'),
});

export const WebsocSectionEnrollment = type({
    totalEnrolled: 'string',
    sectionEnrolled: 'string',
});

export const WebSocSectionFinals = type({
    examStatus: '"NO_FINAL" | "TBA_FINAL" | "SCHEDULED_FINAL"',
    dayOfWeek: '"Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | null',
    month: 'number | null',
    day: 'number | null',
    startTime: union(HourMinute, 'null'),
    endTime: union(HourMinute, 'null'),
    bldg: 'string[] | null',
});

export const WebsocSection = type({
    sectionCode: 'string',
    sectionType: 'string',
    sectionNum: 'string',
    units: 'string',
    instructors: 'string[]',
    meetings: arrayOf(WebsocSectionMeeting),
    finalExam: WebSocSectionFinals,
    maxCapacity: 'string',
    numCurrentlyEnrolled: WebsocSectionEnrollment,
    numOnWaitlist: 'string',
    numWaitlistCap: 'string',
    numRequested: 'string',
    numNewOnlyReserved: 'string',
    restrictions: 'string',
    status: enumerate(['OPEN', 'Waitl', 'FULL', 'NewOnly'] as const),
    sectionComment: 'string',
});

export const WebsocCourse = type({
    deptCode: 'string',
    courseNumber: 'string',
    courseTitle: 'string',
    courseComment: 'string',
    prerequisiteLink: 'string',
    // sections: arrayOf(WebsocSection),
    // Commenting out sections because I don't know how to override this property
});

export const WebsocDepartment = type({
    deptName: 'string',
    deptCode: 'string',
    deptComment: 'string',
    courses: arrayOf(WebsocCourse),
    sectionCodeRangeComments: 'string[]',
    courseNumberRangeComments: 'string[]',
});

export const WebsocSchool = type({
    schoolName: 'string',
    schoolComment: 'string',
    departments: arrayOf(WebsocDepartment),
});

export const Term = type({
    year: 'string',
    quarter: enumerate(quarters),
});

export const WebsocAPIResponse = {
    schools: arrayOf(WebsocSchool),
};

export const Department = type({
    deptLabel: 'string',
    deptValue: 'string',
});

export const DepartmentResponse = arrayOf(Department);

export const TermData = type({
    shortName: 'string' as Infer<`${string} ${Quarter}`>,
    longName: 'string',
});

export const TermResponse = arrayOf(TermData);
