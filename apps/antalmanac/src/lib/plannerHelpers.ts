import { Roadmap } from '@packages/antalmanac-types';

export function doesRoadmapIncludeTerm(roadmap: Roadmap, year: string, quarter: string): boolean {
    const targetStartYear = parseInt(year) - (quarter === 'Fall' ? 0 : 1);
    const yearPlan = roadmap.content.find((yearPlan) => yearPlan.startYear === targetStartYear);
    return !!yearPlan && yearPlan.quarters.find((quarterPlan) => quarterPlan.name === quarter) !== undefined;
}
