import { COURSE_SEARCH_PLANNER_KEY } from '$components/RightPane/CoursePane/SearchForm/SearchParams/constants';
import { type AATerm, Roadmap } from '@packages/antalmanac-types';

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
    if (quarterPlan.courses.length > 0) {
        return RoadmapTermRelation.IncludesTerm;
    }
    return RoadmapTermRelation.NoCourses;
}

export function shouldSearchPlannerFromParams() {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(COURSE_SEARCH_PLANNER_KEY) !== null;
}
