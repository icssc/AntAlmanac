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
export type LegacyUserData = typeof types.legacyUserData.infer;
export type LegacyUser = typeof types.legacyUser.infer;
