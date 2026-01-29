export interface Quarter {
    name: string;
    courses: string[];
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

export interface PeterPortalAPIResponse {
    result: {
        data: Roadmap[];
    };
}
