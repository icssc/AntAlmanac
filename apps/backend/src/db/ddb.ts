import type { Type } from 'arktype';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

import {
    UserSchema,
    LegacyUserSchema,
    ShortCourseSchema,
    RepeatingCustomEventSchema,
    type LegacyUserData,
    type ScheduleSaveState,
} from '@packages/antalmanac-types';

import LegacyUserModel from '../models/User';
import connectToMongoDB from '../db/mongodb';
import env from '../env';

/**
 * TODO: enforce this in the schema too, or just leave it as an arbitrary string?
 */
export const VISIBILITY = {
    PRIVATE: 'private',
    PUBLIC: 'public',
    OPEN: 'open',
};

class DDBClient<T extends Type<Record<string, unknown>>> {
    tableName: string;

    schema: T;

    client: DynamoDB;

    documentClient: DynamoDBDocument;

    static convertLegacySchedule(legacyUserData: LegacyUserData) {
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

    constructor(tableName: string, schema: T) {
        this.tableName = tableName;
        this.schema = schema;
        this.client = new DynamoDB({
            region: env.AWS_REGION,
        });
        this.documentClient = DynamoDBDocument.from(this.client, {
            marshallOptions: {
                /**
                 * Some JSON properties may exist and be undefined.
                 * DDB will throw an error unless this is true.
                 *
                 * @example { "property": undefined }
                 */
                removeUndefinedValues: true,
            },
        });
    }

    async get(column: string, id: string): Promise<T['infer'] | undefined> {
        const params = {
            TableName: this.tableName,
            Key: {
                [column]: id,
            },
        };

        const { Item } = await this.documentClient.get(params);

        const { data } = this.schema(Item);

        return data;
    }

    async insertItem(item: T['infer']) {
        await this.documentClient.put({ TableName: this.tableName, Item: item });
    }

    async updateSchedule(id: string, schedule: ScheduleSaveState) {
        const params = {
            TableName: this.tableName,
            Key: {
                id: id,
            },
            UpdateExpression: 'set userData = :u',
            ExpressionAttributeValues: {
                ':u': schedule,
            },
        };

        await this.documentClient.update(params);
    }

    async getLegacyUserData(userId: string) {
        await connectToMongoDB();

        const { data, problems } = LegacyUserSchema(await LegacyUserModel.findById(userId));

        if (problems != null || data.userData == null) {
            return undefined;
        }

        return { id: userId, userData: DDBClient.convertLegacySchedule(data.userData) };
    }

    async getUserData(id: string) {
        return (await ddbClient.get('id', id))?.userData;
    }

    async getGoogleUserData(googleId: string) {
        return (await ddbClient.get('googleId', googleId))?.userData;
    }

    async viewUserData(requesteeId: string, requesterId?: string) {
        const existingUserData = await ddbClient.get('id', requesteeId);

        if (existingUserData == null) {
            return null;
        }

        const parsedUserData = UserSchema(existingUserData);

        if (parsedUserData.problems != null) {
            return null;
        }

        const visibility = parsedUserData.data.visibility ?? VISIBILITY.PUBLIC;

        // Requester and requestee IDs must match if schedule is private.
        // Otherwise, return the schedule without any additional processing.
        //
        // TODO: when a save request is made,
        // check the schedule's user ID with the user ID making the request
        // to fully define the visibility system.

        if (visibility === VISIBILITY.PRIVATE) {
            return requesterId === requesteeId ? parsedUserData.data : null;
        } else {
            return parsedUserData.data;
        }
    }
}

export const ddbClient = new DDBClient(env.USERDATA_TABLE_NAME, UserSchema);
