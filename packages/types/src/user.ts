import { ScheduleSaveStateSchema } from './schedule';
import { type } from 'arktype';

/**
 * Users are stored in one shared table.
 *
 * All users can be queried by their `id`.
 * Google users can be queried via the `googleId` column.
 */
export const UserSchema = type({
    /**
     * All users have a unique ID.
     * Users logging in with Google will have their ID default to their Google ID.
     *
     * TODO: Handle case where existing ID conflicts with the Google ID.
     */
    id: 'string',

    /**
     * Some users will have a Google ID from logging in via Google OAuth.
     * They can still use their ID to log in.
     */
    'googleId?': 'string',

    /**
     * User data is stored in a JSON.
     */
    userData: ScheduleSaveStateSchema,

    // Additional fields. Can be provided by Google OAuth.

    'name?': 'string',
    'email?': 'string',
    'picture?': 'string',
});

export type User = typeof UserSchema.infer;
