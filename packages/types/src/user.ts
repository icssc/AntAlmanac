import { ScheduleSaveStateSchema } from './schedule';
import { type } from 'arktype';

export const UserSchema = type({
    id: 'string',
    userData: ScheduleSaveStateSchema,
});

export const GoogleUserSchema = type({
    sub: 'string',
    email: 'string',
    name: 'string',
    'picture?': 'string',
});

export type User = typeof UserSchema.infer;

export type GoogleUser = typeof GoogleUserSchema.infer;
