import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

import {
    UserSchema,
    LegacyUserSchema,
    ShortCourseSchema,
    RepeatingCustomEventSchema,
    type LegacyUserData,
    type ScheduleSaveState,
    type User,
} from '@packages/antalmanac-types';

import LegacyUserModel from '../models/User';
import connectToMongoDB from '../db/mongodb';
import env from '../env';

class DDBClient<T extends Record<string, any>> {
    client: DynamoDB;

    documentClient: DynamoDBDocument;

    private tableName: string;

    private schema: any;

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

    constructor(tableName: string, schema: any) {
        this.client = new DynamoDB({
            region: env.AWS_REGION,
        });

        // Create DynamoDB DocumentClient
        this.documentClient = DynamoDBDocument.from(this.client, {
            marshallOptions: {
                /**
                 * Some JSON properties may exist and be undefined; DDB will throw an error unless this is true.
                 * @example { "property": undefined }
                 */
                removeUndefinedValues: true,
            },
        });
        this.tableName = tableName;
        this.schema = schema;
    }

    async get(id: string): Promise<T | undefined> {
        const params = {
            TableName: this.tableName,
            Key: {
                id: id,
            },
        };

        const { Item } = await this.documentClient.get(params);
        const { data, problems } = this.schema(Item);
        return problems === undefined ? data : undefined;
    }

    async insertItem(item: T) {
        await this.documentClient.put({
            TableName: this.tableName,
            Item: item,
        });
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
        if (problems !== undefined) {
            return undefined;
        }

        const legacyUserData = data?.userData;
        return legacyUserData ? { id: userId, userData: DDBClient.convertLegacySchedule(legacyUserData) } : undefined;
    }

    async getUserData(userId: string) {
        return (await ddbClient.get(userId))?.userData;
    }
}

export const ddbClient = new DDBClient<User>(env.USERDATA_TABLE_NAME, UserSchema);
