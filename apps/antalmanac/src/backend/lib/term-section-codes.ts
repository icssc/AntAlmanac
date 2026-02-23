import { terms } from "$generated/termData";
import {
    SectionSearchResult,
    WebsocCourse,
    WebsocDepartment,
    WebsocSchool,
    WebsocSection,
} from "@packages/antalmanac-types";
export interface SectionCodesGraphQLResponse {
    data: {
        websoc: {
            schools: WebsocSchool[];
        };
    };
}

export interface SectionCodesRESTResponse {
    data: {
        schools: WebsocSchool[];
    };
}

export function parseSectionCodesREST(
    response: SectionCodesRESTResponse,
): Record<string, SectionSearchResult> {
    const results: Record<string, SectionSearchResult> = {};
    response.data.schools.forEach((school: WebsocSchool) => {
        school.departments.forEach((department: WebsocDepartment) => {
            department.courses.forEach((course: WebsocCourse) => {
                course.sections.forEach((section: WebsocSection) => {
                    const sectionCode = section.sectionCode;
                    results[sectionCode] = {
                        type: "SECTION",
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

export function parseSectionCodes(
    response: SectionCodesGraphQLResponse,
): Record<string, SectionSearchResult> {
    const results: Record<string, SectionSearchResult> = {};
    response.data.websoc.schools.forEach((school: WebsocSchool) => {
        school.departments.forEach((department: WebsocDepartment) => {
            department.courses.forEach((course: WebsocCourse) => {
                course.sections.forEach((section: WebsocSection) => {
                    const sectionCode = section.sectionCode;
                    results[sectionCode] = {
                        type: "SECTION",
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
