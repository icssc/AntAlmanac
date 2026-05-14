import type { SectionSearchResult } from '@packages/antalmanac-types';
import type { WebsocAPIResponse } from '@packages/anteater-api/types';

type CourseAvailabilitySection = Pick<SectionSearchResult, 'department' | 'courseNumber'> & {
    isCancelled?: boolean;
};

export function getCourseAvailabilityKey(department: string, courseNumber: string) {
    return `${department}-${courseNumber}`;
}

export function isSectionOffered(section: { isCancelled?: boolean }) {
    return section.isCancelled !== true;
}

export function getOfferedCourseSet(sections: Iterable<CourseAvailabilitySection>) {
    const offeredCourseSet = new Set<string>();

    for (const section of sections) {
        if (isSectionOffered(section)) {
            offeredCourseSet.add(getCourseAvailabilityKey(section.department, section.courseNumber));
        }
    }

    return offeredCourseSet;
}

export function isCourseOffered(
    department: string,
    courseNumber: string,
    offeredCourseSet: ReadonlySet<string>
): boolean {
    return offeredCourseSet.has(getCourseAvailabilityKey(department, courseNumber));
}

export function filterCancelledSectionsFromResponse(response: WebsocAPIResponse): WebsocAPIResponse {
    return {
        ...response,
        schools: response.schools
            .map((school) => ({
                ...school,
                departments: school.departments
                    .map((department) => ({
                        ...department,
                        courses: department.courses
                            .map((course) => ({
                                ...course,
                                sections: course.sections.filter(isSectionOffered),
                            }))
                            .filter((course) => course.sections.length > 0),
                    }))
                    .filter((department) => department.courses.length > 0),
            }))
            .filter((school) => school.departments.length > 0),
    };
}
