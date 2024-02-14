import { ScheduleSaveStateSchema } from './schedule';
import { type } from 'arktype';

export const UserSchema = type({
    id: 'string',
    userData: ScheduleSaveStateSchema,

    'googleId?': 'string',
    'name?': 'string',
    'email?': 'string',
    'picture?': 'string',
});

export type User = typeof UserSchema.infer;
