import type { Quarter } from '@packages/anteater-api/types';

interface RoadmapCourse {
    courseId: string;
    userChosenUnits?: number;
}

interface RoadmapQuarter {
    name: Quarter;
    courses: RoadmapCourse[];
}

interface RoadmapContent {
    name: string;
    startYear: number;
    quarters: RoadmapQuarter[];
}

export interface Roadmap {
    id: string | number;
    name: string;
    chc?: string | null;
    content: RoadmapContent[];
}

export interface PlannerAPIResponse {
    result: {
        data: Roadmap[];
    };
}
