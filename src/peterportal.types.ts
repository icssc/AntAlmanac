// Ripped straight from here: https://github.com/icssc/peterportal-public-api/tree/master/types
// Permalinks for each file copied are included inline
// Some interfaces have been modified. The modifications have docstring comments.

// Start of websoc.types.ts https://github.com/icssc/peterportal-public-api/blob/c539a62acfbfda1481152272582632a168f34302/types/websoc.types.ts
export interface WebsocResponse {
    schools: School[]
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
    /** A hex RGB string prefixed by #. Added optionally since we inject this after receiving the API response. */
    color?: string
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

// beginning of types.ts: https://github.com/icssc/peterportal-public-api/blob/c539a62acfbfda1481152272582632a168f34302/types/types.ts

export interface Error {
    timestamp: string;
    status: number;
    error: string;
    message: string
}

export interface Course {
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
    course: Course;
}

export interface Instructor {
    name: string;
    shortened_name: string;
    ucinetid: string;
    title: string;
    department: string;
    schools: string[];
    related_departments: string[];
    course_history: string[]
}

export type GradeRawData = GradeData[];

export interface GradeCalculatedData {
    gradeDistribution: GradeDistAggregate;
    courseList: GradeCourse[]
}

export interface GradeCourse {
    year: string;
    quarter: string;
    department: string;
    department_name: string;
    title: string;
    number: string;
    code: number;
    section: string;
    instructor: string;
    type: string
}

export interface GradeDistAggregate {
    sum_grade_a_count: number;
    sum_grade_b_count: number;
    sum_grade_c_count: number;
    sum_grade_d_count: number;
    sum_grade_f_count: number;
    sum_grade_p_count: number;
    sum_grade_np_count: number;
    sum_grade_w_count: number;
    average_gpa: number;
    count: number
}

export interface GradeData {
    year: string;
    quarter: string;
    department: string;
    department_name: string;
    number: string;
    number_int: number;
    code: number;
    section: string;
    title: string;
    instructor: string;
    type: string;
    gradeACount: number;
    gradeBCount: number;
    gradeCCount: number;
    gradeDCount: number;
    gradeFCount: number;
    gradePCount: number;
    gradeNPCount: number;
    gradeWCount: number;
    averageGPA: number;
}

export interface GradeGQLData {
    grade_a_count: number;
    grade_b_count: number;
    grade_c_count: number;
    grade_d_count: number;
    grade_f_count: number;
    grade_p_count: number;
    grade_np_count: number;
    grade_w_count: number;
    average_gpa: number;
    course_offering: {
      year: string;
      quarter: string;
      section: {
        code: number;
        number: string;
        type: string;
      };
      instructors: string[];
      course: {
        id: string;
        department: string;
        number: string;
        department_name: string;
        title: string
      }
    }
}

export interface WhereParams {
    where: string;
    params: string[];
}

export interface WeekParams {
    year: string;
    month: string;
    day: string;
}