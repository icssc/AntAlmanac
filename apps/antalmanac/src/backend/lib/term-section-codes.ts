import {
    SectionSearchResult,
    WebsocCourse,
    WebsocDepartment,
    WebsocSchool,
    WebsocSection,
} from '@packages/antalmanac-types';

export interface SectionCodesGraphQLResponse {
    data: {
        websoc: {
            schools: WebsocSchool[];
        };
    };
}

export interface SectionCodesResponse {
    schools: WebsocSchool[];
}

export function parseSectionCodes(response: SectionCodesGraphQLResponse): Record<string, SectionSearchResult> {
    const results: Record<string, SectionSearchResult> = {};
    response.data.websoc.schools.forEach((school: WebsocSchool) => {
        school.departments.forEach((department: WebsocDepartment) => {
            department.courses.forEach((course: WebsocCourse) => {
                course.sections.forEach((section: WebsocSection) => {
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
