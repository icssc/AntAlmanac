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
    sectionCodes: Record<string, SectionSearchResult>;
    instructorNames: Set<string>;
}

export function parseWebSocData(response: SectionCodesGraphQLResponse): ParsedWebSocData {
    const sectionCodes: Record<string, SectionSearchResult> = {};
    const instructorNames = new Set<string>();

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

                    sectionCodes[section.sectionCode] = data;

                    section.instructors.forEach((name) => instructorNames.add(name));
                });
            });
        });
    });

    return { sectionCodes, instructorNames };
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
