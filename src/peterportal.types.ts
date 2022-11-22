// Ripped straight from here: https://github.com/icssc/peterportal-public-api/blob/c539a62acfbfda1481152272582632a168f34302/types/websoc.types.ts
// Some interfaces aren't straight from PeterPortal. The new interfaces are prefixed with AA

export interface WebsocResponse {
    schools: School[]
} 

export interface School {
    schoolName: string
    schoolComment: string
    departments: Department[]
}

export interface Department {
    deptName: string
    deptCode: string
    deptComment: string
    courses: Course[]
    sectionCodeRangeComments: string[]
    courseNumberRangeComments: string[]
}

export interface Course {
    courseNumber: string
    courseTitle: string
    courseComment: string
    prerequisiteLink: string
    sections: Section[]
}

/**
 * Same as Course, except includes a `deptCode` and sections contains AASection objects, which have colors.
 */
export interface AACourse extends Course {
    sections: AASection[]
    deptCode: string
}

export interface Section {
    sectionCode: string
    sectionType: string
    sectionNum: string
    units: string
    instructors: string[]
    meetings: Meeting[]
    finalExam: string
    maxCapacity: string
    numCurrentlyEnrolled: EnrollmentCount
    numOnWaitlist: string
    numRequested: string
    numNewOnlyReserved: string
    restrictions: string
    status: string
    sectionComment: string
}

/**
 * Same as Section, except also has a color
 */
export interface AASection extends Section {
    /** A hex RGB string prefixed by #. Added since we inject this after receiving the API response. */
    color: string
}

export interface Meeting {
    days: string
    time: string
    bldg: string
}

export interface EnrollmentCount {
    totalEnrolled: string
    sectionEnrolled: string
}


export interface SectionGQL {
    code: string
    comment: string
    number: string
    type: string
}