// Ripped straight from here: https://github.com/icssc/peterportal-public-api/blob/c539a62acfbfda1481152272582632a168f34302/types/websoc.types.ts
// Some interfaces aren't straight from PeterPortal. The new interfaces are prefixed with AA

export interface WebsocResponse {
    schools: School[];
}

export interface School {
    schoolName: string;
    schoolComment: string;
    departments: Department[];
}

export interface Department {
    deptName: string;
    deptCode: string;
    deptComment: string;
    courses: Course[];
    sectionCodeRangeComments: string[];
    courseNumberRangeComments: string[];
}

export interface Course {
    courseNumber: string;
    courseTitle: string;
    courseComment: string;
    prerequisiteLink: string;
    sections: Section[];
}

export interface CourseResponse {
    id: string;
    department: string;
    number: string;
    school: string;
    title: string;
    course_level: string;
    department_alias: string[];
    units: number[];
    description: string;
    department_name: string;
    professor_history: string[];
    prerequisite_tree: string;
    prerequisite_list: string[];
    prerequisite_text: string;
    prerequisite_for: string[];
    repeatability: string;
    grading_option: string;
    concurrent: string;
    same_as: string;
    restriction: string;
    overlap: string;
    corequisite: string;
    ge_list: string[];
    ge_text: string;
    terms: string[];
    course_offering?: CourseOffering[];
}

export interface CourseOffering {
    year: string;
    quarter: string;
    instructors: string[];
    final_exam: string;
    max_capacity: number;
    meetings: Meeting[];
    num_section_enrolled: number;
    num_total_enrolled: number;
    num_new_only_reserved: number;
    num_on_waitlist: number;
    num_requested: number;
    restrictions: string;
    section: SectionGQL;
    status: string;
    units: number;
    course: CourseResponse;
}

/**
 * Same as Course, except includes a `deptCode` and sections contains AASection objects, which have colors.
 */
export interface AACourse extends Course {
    sections: AASection[];
    deptCode: string;
}

export interface Section {
    sectionCode: string;
    sectionType: string;
    sectionNum: string;
    units: string;
    instructors: string[];
    meetings: Meeting[];
    finalExam: string;
    maxCapacity: string;
    numCurrentlyEnrolled: EnrollmentCount;
    numOnWaitlist: string;
    numRequested: string;
    numNewOnlyReserved: string;
    restrictions: string;
    status: string;
    sectionComment: string;
}

/**
 * Same as Section, except also has a color
 */
export interface AASection extends Section {
    /** A hex RGB string prefixed by #. Added since we inject this after receiving the API response. */
    color: string;
}

export interface Meeting {
    days: string;
    time: string;
    bldg: string;
}

export interface EnrollmentCount {
    totalEnrolled: string;
    sectionEnrolled: string;
}

export interface SectionGQL {
    code: string;
    comment: string;
    number: string;
    type: string;
}

export interface PrerequisiteJSON {
    [key: string]: PrerequisiteJSONNode[];
}

export type PrerequisiteJSONNode = PrerequisiteJSON | string;
