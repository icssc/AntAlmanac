import { type } from 'arktype';
import {
    LegacyUserSchema,
    LegacyUserData,
    UserSchema,
    ScheduleSaveState,
    RepeatingCustomEventSchema,
    ShortCourseSchema,
} from '@packages/antalmanac-types';
import { router, procedure } from '../trpc';
import { ScheduleCodeClient } from '../db/ddb';
import LegacyUserModel from '../models/User';

import connectToMongoDB from '../db/mongodb';

const userInputSchema = type([{ userId: 'string' }, '|', { googleId: 'string' }]);

export function convertLegacySchedule(legacyUserData: LegacyUserData) {
    const scheduleSaveState: ScheduleSaveState = { schedules: [], scheduleIndex: 0 };
    for (const scheduleName of legacyUserData.scheduleNames) {
        scheduleSaveState.schedules.push({
            scheduleName: scheduleName,
            courses: [],
            customEvents: [],
            scheduleNote: '',
        });
    }
    for (const course of legacyUserData.addedCourses) {
        const { data, problems } = ShortCourseSchema(course);
        if (data === undefined) {
            console.log(problems);
            continue;
        }
        for (const scheduleIndex of course.scheduleIndices) {
            scheduleSaveState.schedules[scheduleIndex].courses.push(data);
        }
    }
    for (const customEvent of legacyUserData.customEvents) {
        for (const scheduleIndex of customEvent.scheduleIndices) {
            const { data } = RepeatingCustomEventSchema(customEvent);
            if (data !== undefined) {
                scheduleSaveState.schedules[scheduleIndex].customEvents.push(data);
            }
        }
    }
    return scheduleSaveState;
}

async function getLegacyUserData(userId: string) {
    await connectToMongoDB();
    const { data, problems } = LegacyUserSchema(await LegacyUserModel.findById(userId));
    if (problems !== undefined) {
        return undefined;
    }
    const legacyUserData = data?.userData;
    return legacyUserData ? { id: userId, userData: convertLegacySchedule(legacyUserData) } : undefined;
}

async function getUserData(userId: string) {
    return (await ScheduleCodeClient.get(userId))?.userData;
}

const usersRouter = router({
    getUserData: procedure.input(userInputSchema.assert).query(async ({ input }) => {
        if ('userId' in input) {
            return (await getUserData(input.userId)) ?? (await getLegacyUserData(input.userId));
        } else {
            console.log('Google is not yet supported... Google ID: ', input.googleId);
        }
    }),
    saveUserData: procedure.input(UserSchema.assert).mutation(async ({ input }) => {
        await ScheduleCodeClient.insertItem(input);
    }),
});

export default usersRouter;
