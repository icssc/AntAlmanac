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
    const quarterPlan = getQuarterPlan(roadmap, year, quarter);
    return quarterPlan !== null && quarterPlan.courses.length > 0;
}
