import { type AATerm, type Roadmap } from '@packages/antalmanac-types';

export enum RoadmapTermRelation {
    IncludesTerm = 'includes',
    ExcludesTerm = 'excludes',
    NoCourses = 'noCourses',
}

export function getQuarterPlan(roadmap: Roadmap, term: AATerm) {
    const targetStartYear = parseInt(term.year) - (term.quarter === 'Fall' ? 0 : 1);
    const yearPlan = roadmap.content.find((yearPlan) => yearPlan.startYear === targetStartYear);
    if (!yearPlan) {
        return null;
    }
    return yearPlan.quarters.find((quarterPlan) => quarterPlan.name === term.quarter) ?? null;
}

export function getRoadmapTermRelation(roadmap: Roadmap, term: AATerm): RoadmapTermRelation {
    const quarterPlan = getQuarterPlan(roadmap, term);
    if (quarterPlan === null) {
        return RoadmapTermRelation.ExcludesTerm;
    }
    const searchable = quarterPlan.courses.filter((c) => !c.courseId.startsWith('CUSTOM#'));
    if (searchable.length > 0) {
        return RoadmapTermRelation.IncludesTerm;
    }
    return RoadmapTermRelation.NoCourses;
}

export function getSearchableRoadmapCourseIds(roadmap: Roadmap, term: AATerm): string[] {
    const quarterPlan = getQuarterPlan(roadmap, term);
    if (!quarterPlan) return [];
    return quarterPlan.courses.filter((c) => !c.courseId.startsWith('CUSTOM#')).map((c) => c.courseId);
}
