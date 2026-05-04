interface Course {
    courseId: string;
    userChosenUnits?: number;
}

export interface Quarter {
    name: string;
    courses: Course[];
}

export interface RoadmapContent {
    name: string;
    startYear: number;
    quarters: Quarter[];
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
