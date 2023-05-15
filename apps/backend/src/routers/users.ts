import { router, procedure } from '../trpc'
import { getById, insertById } from '$db/ddb';
import LegacyUserModel from '$models/User';
import {Problem, type} from 'arktype'

import {
    LegacyUserSchema,
    LegacyUserData,
    UserSchema,
    ScheduleSaveState,
    RepeatingCustomEventSchema, LegacyUser
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
        for (const scheduleIndex of course.scheduleIndices) {
            scheduleSaveState.schedules[scheduleIndex].courses.push({ ...course });
        }
    }
    for (const customEvent of legacyUserData.customEvents) {
        for (const scheduleIndex of customEvent.scheduleIndices) {
            const { data } = RepeatingCustomEventSchema({ ...customEvent })
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
    const data = await LegacyUserModel.findById(userId) ;
    console.log(data)
    const legacyUserData = data?.userData
    return legacyUserData ? { id: userId, userData: convertLegacySchedule(legacyUserData) } : undefined;
}

async function getUserData(userId: string) {
    try {
        const {data: userData} = UserSchema(await getById(userId));
        return userData
    }
    catch(e) {
        if (e instanceof Problem){
            return undefined
        }
        else {
            throw e
        }
    }
}

const usersRouter = router({
    getUserData: procedure
        .input(type({userId: 'string'}).assert)
        .query(async ({input}) => {
            const data = await getUserData(input.userId) ?? await getLegacyUserData(input.userId)
            console.log(data)
            return data
        })

    // saveLegacyUserData: procedure.query(async (userId: string, userData: ScheduleSaveState ) => {
    //     await insertById(userId, JSON.stringify({userData}));
    // }),
})

export default usersRouter;

