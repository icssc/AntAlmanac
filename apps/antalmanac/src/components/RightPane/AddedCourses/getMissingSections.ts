import { WebsocSectionType } from '@packages/antalmanac-types';

import { CourseWithTerm } from '$components/RightPane/AddedCourses/AddedCoursePane';
import { sectionTypeToName } from '$lib/utils';

export const getMissingSections = (userCourses: CourseWithTerm): string[] => {
    const requiredTypes = new Set<WebsocSectionType>(userCourses.sectionTypes ?? []);

    if (requiredTypes.size === 0) {
        return [];
    }

    const userTypes = new Set(userCourses.sections.map((section) => section.sectionType));
    const missingTypes = [...requiredTypes].filter((type) => !userTypes.has(type));
    const missingSections = missingTypes.map(sectionTypeToName);
    return missingSections;
};
