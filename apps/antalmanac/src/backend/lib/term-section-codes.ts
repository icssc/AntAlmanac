import {
    SectionSearchResult,
    WebsocCourse,
    WebsocDepartment,
    WebsocSchool,
    WebsocSection,
} from '@packages/antalmanac-types';

import { terms } from '$generated/termData';
export interface SectionCodesGraphQLResponse {
    data: {
        websoc: {
            schools: WebsocSchool[];
        };
    };
}
export interface ParsedWebSocData {
    sectionCodes: Record<string, SectionSearchResult>; // Search by Code (Unique)
    instructors: Record<string, SectionSearchResult[]>; // Search by Name (Grouped)
}

export function parseWebSocData(response: SectionCodesGraphQLResponse): ParsedWebSocData {
    const sectionCodes: Record<string, SectionSearchResult> = {};
    const instructors: Record<string, SectionSearchResult[]> = {};

    response.data.websoc.schools.forEach((school: WebsocSchool) => {
        school.departments.forEach((department: WebsocDepartment) => {
            department.courses.forEach((course: WebsocCourse) => {
                course.sections.forEach((section: WebsocSection) => {
                    const data: SectionSearchResult = {
                        type: 'SECTION',
                        department: department.deptCode,
                        courseNumber: course.courseNumber,
                        sectionCode: section.sectionCode,
                        sectionNum: section.sectionNum,
                        sectionType: section.sectionType,
                    };

                    const sectionCode = section.sectionCode;
                    sectionCodes[sectionCode] = data;

                    section.instructors.forEach((name) => {
                        if (!instructors[name]) {
                            instructors[name] = [];
                        }
                        instructors[name].push(data);
                    });
                });
            });
        });
    });

    return { sectionCodes, instructors };
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
