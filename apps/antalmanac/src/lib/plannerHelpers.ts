import { Roadmap } from '@packages/antalmanac-types';

export enum RoadmapTermRelation {
    IncludesTerm = 'includes',
    ExcludesTerm = 'excludes',
    NoCourses = 'noCourses',
}

export function getQuarterPlan(roadmap: Roadmap, year: string, quarter: string) {
    const targetStartYear = parseInt(year) - (quarter === 'Fall' ? 0 : 1);
    const yearPlan = roadmap.content.find((yearPlan) => yearPlan.startYear === targetStartYear);
    if (!yearPlan) {
        return null;
    }
    return yearPlan.quarters.find((quarterPlan) => quarterPlan.name === quarter) ?? null;
}

export function getRoadmapTermRelation(roadmap: Roadmap, year: string, quarter: string): RoadmapTermRelation {
    const quarterPlan = getQuarterPlan(roadmap, year, quarter);
    if (quarterPlan === null) {
        return RoadmapTermRelation.ExcludesTerm;
    }
    if (quarterPlan.courses.length > 0) {
        return RoadmapTermRelation.IncludesTerm;
    }
    return RoadmapTermRelation.NoCourses;
}
