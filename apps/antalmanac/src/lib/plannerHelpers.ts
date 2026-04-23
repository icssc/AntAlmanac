import { useDepartmentsStore } from '$stores/DepartmentsStore';
import { Roadmap } from '@packages/antalmanac-types';

export function getQuarterPlan(roadmap: Roadmap, year: string, quarter: string) {
    const targetStartYear = parseInt(year) - (quarter === 'Fall' ? 0 : 1);
    const yearPlan = roadmap.content.find((yearPlan) => yearPlan.startYear === targetStartYear);
    if (!yearPlan) {
        return null;
    }
    return yearPlan.quarters.find((quarterPlan) => quarterPlan.name === quarter) ?? null;
}

export function doesRoadmapIncludeTerm(roadmap: Roadmap, year: string, quarter: string): boolean {
    return getQuarterPlan(roadmap, year, quarter) !== null;
}

export function parsePlannerCourseId(courseId: string): { department: string; courseNumber: string } {
    const departments = useDepartmentsStore.getState().departments;
    if (!departments) {
        throw new Error(`Could not parse planner course id: ${courseId}`);
    }

    for (const department of Object.keys(departments)) {
        const departmentWithoutSpaces = department.replace(' ', '');
        if (courseId.startsWith(departmentWithoutSpaces)) {
            const courseNumber = courseId.slice(departmentWithoutSpaces.length);
            return { department: department, courseNumber: courseNumber };
        }
    }
    throw new Error(`Could not parse planner course id: ${courseId}`);
}
