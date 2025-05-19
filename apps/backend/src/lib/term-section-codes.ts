import { SectionSearchResult } from '@packages/antalmanac-types';
import { terms } from '$generated/termData';

interface SectionData {
    sectionCode: string;
    sectionType: string;
    sectionNum: string;
}

interface CourseData {
    courseTitle: string;
    courseNumber: string;
    sections: SectionData[];
}

interface DepartmentData {
    deptCode: string;
    courses: CourseData[];
}

export interface SectionCodesGraphQLResponse {
    data: {
        websoc: {
            schools: {
                departments: DepartmentData[];
            }[];
        };
    };
}

export function parseSectionCodes(response: SectionCodesGraphQLResponse): Record<string, SectionSearchResult> {
    const results: Record<string, SectionSearchResult> = {};

    response.data.websoc.schools.forEach((school) => {
        school.departments.forEach((department) => {
            department.courses.forEach((course) => {
                course.sections.forEach((section) => {
                    const sectionCode = section.sectionCode;
                    results[sectionCode] = {
                        type: 'SECTION',
                        department: department.deptCode,
                        courseNumber: course.courseNumber,
                        sectionCode: section.sectionCode,
                        sectionNum: section.sectionNum,
                        sectionType: section.sectionType,
                    };
                });
            });
        });
    });

    return results;
}

export type Term = {
    shortName: `${string} ${string}`;
    longName: string;
    startDate: Date;
    finalsStartDate: Date;
    socAvailable: Date;
    isSummerTerm: boolean;
};

/**
 * Only include terms that have a SOC available.
 */
export const termData = terms.filter((term) => {
    return term.socAvailable <= new Date();
});
