import { type SectionSearchResult } from '@packages/antalmanac-types';
import { type GraphQLEnvelope } from '@packages/anteater-api/client';
import {
    type WebsocCourse,
    type WebsocDepartment,
    type WebsocSchool,
    type WebsocSection,
} from '@packages/anteater-api/types';

export interface SectionCodesGraphQLResponse {
    data: {
        websoc: {
            schools: WebsocSchool[];
        };
    };
}

function isSectionCodesGraphQLResponse(response: GraphQLEnvelope): response is SectionCodesGraphQLResponse {
    if (typeof response.data !== 'object' || response.data === null || !('websoc' in response.data)) {
        return false;
    }

    const { websoc } = response.data;
    return typeof websoc === 'object' && websoc !== null && 'schools' in websoc && Array.isArray(websoc.schools);
}

export function parseSectionCodes(response: GraphQLEnvelope): Record<string, SectionSearchResult> {
    if (!isSectionCodesGraphQLResponse(response)) {
        throw new Error('Invalid section codes GraphQL response');
    }

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
