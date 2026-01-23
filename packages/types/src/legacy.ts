import { scope } from 'arktype';

const types = scope({
    legacyCourse: {
        color: 'string',
        term: 'string',
        sectionCode: 'string',
        scheduleIndices: 'number[]',
    },
    legacyCustomEvent: {
        customEventID: 'string',
        color: 'string',
        title: 'string',
        days: 'boolean[]',
        scheduleIndices: 'number[]',
        start: 'string',
        end: 'string',
    },
    legacyUserData: {
        addedCourses: 'legacyCourse[]',
        scheduleNames: 'string[]',
        customEvents: 'legacyCustomEvent[]',
    },
    legacyUser: {
        _id: 'string',
        userData: 'legacyUserData',
    },
}).compile();

export const LegacyUserSchema = types.legacyUser;

// Explicit TypeScript types to avoid depending on arktype's inferred literal types
export type LegacyCourse = {
    color: string;
    term: string;
    sectionCode: string;
    scheduleIndices: number[];
};

export type LegacyCustomEvent = {
    customEventID: string;
    color: string;
    title: string;
    days: boolean[];
    scheduleIndices: number[];
    start: string;
    end: string;
};

export type LegacyUserData = {
    addedCourses: LegacyCourse[];
    scheduleNames: string[];
    customEvents: LegacyCustomEvent[];
};

export type LegacyUser = {
    _id: string;
    userData: LegacyUserData;
};
