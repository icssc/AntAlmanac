import { Schema, model } from 'mongoose';
import { LegacyUser } from '@packages/antalmanac-types';

const UserSchema = new Schema<LegacyUser>(
    {
        _id: String,
        userData: {
            addedCourses: [
                {
                    color: String,
                    term: String,
                    sectionCode: String,
                    scheduleIndices: [Number],
                },
            ],
            scheduleNames: { type: [String], default: ['Schedule 1', 'Schedule 2', 'Schedule 3', 'Schedule 4'] },
            customEvents: [
                {
                    customEventID: String,
                    color: String,
                    title: String,
                    days: [Boolean],
                    scheduleIndices: [Number],
                    start: String,
                    end: String,
                },
            ],
        },
    },
    {
        collection: 'users',
    }
);

export default model<LegacyUser>('LegacyUser', UserSchema);
