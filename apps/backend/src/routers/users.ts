import { router, procedure } from '../trpc'
import { getById, insertById } from '$db/ddb';
import LegacyUserModel from '$models/User';
import {Problem, type} from 'arktype'

import {
    LegacyUserSchema,
    LegacyUserData,
    UserSchema,
    ScheduleSaveState,
    RepeatingCustomEventSchema, ShortCourseSchema
} from 'antalmanac-types'
import connectToMongoDB from "$db/mongodb";

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
        const { data, problems } = ShortCourseSchema(course)
        if (data === undefined) {
            console.log(problems)
            continue
        }
        for (const scheduleIndex of course.scheduleIndices) {
            scheduleSaveState.schedules[scheduleIndex].courses.push(data);
        }
    }
    for (const customEvent of legacyUserData.customEvents) {
        for (const scheduleIndex of customEvent.scheduleIndices) {
            const { data } = RepeatingCustomEventSchema(customEvent)
            if (data !== undefined) {
                scheduleSaveState.schedules[scheduleIndex].customEvents.push(data);
            }
        }
    }
    return scheduleSaveState;
}

async function getLegacyUserData(userId: string) {
    await connectToMongoDB();
    console.log('loading legacy user data')
    const {data, problems} = LegacyUserSchema(await LegacyUserModel.findById(userId));
    if (problems !== undefined) {
        return undefined
    }
    console.log('loaded legacy user data')
    // console.log(JSON.stringify(data, null, 2))
    const legacyUserData = data?.userData
    return legacyUserData ? { id: userId, userData: convertLegacySchedule(legacyUserData) } : undefined;
}

async function getUserData(userId: string) {
    const {data: userData, problems} = UserSchema(await getById(userId));
    console.log(userData)
    if (problems !== undefined) {
        return undefined
    }
    return userData
}

const usersRouter = router({
    getUserData: procedure
        .input(type({userId: 'string'}).assert)
        .query(async ({input}) => {
            return await getUserData(input.userId) ?? await getLegacyUserData(input.userId)
        }),
    saveUserData: procedure
        .input(UserSchema.assert)
        .mutation(async ({input}) => {
            await insertById(input.id, input.userData);
        })
})

export default usersRouter;

