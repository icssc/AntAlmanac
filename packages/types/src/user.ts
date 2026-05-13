import { z } from 'zod';

import { ScheduleSaveStateSchema } from './schedule';

/**
 * Users are stored in one shared table.
 *
 * All users can be queried by their `id`.
 */
export const UserSchema = z.object({
    /**
     * All users have a unique ID.
     * Users logging in with Google will have their ID default to their Google ID.
     *
     * TODO: Handle case where existing ID conflicts with the Google ID.
     */
    id: z.string(),

    /**
     * Users can view other users' schedules, even anonymously.
     * Visibility permissions are used to determine if a user can view another user's schedule.
     *
     * Visibility values:
     * - (default) private: Only the owner can view and edit.
     * - public: Other users can view, but can't edit, i.e. "read-only".
     * - open: Anybody can view and edit.
     */
    visibility: z.string().optional(),

    /**
     * User data is stored in a JSON.
     */
    userData: ScheduleSaveStateSchema,

    // Additional fields. Can be provided by Google OAuth.

    name: z.string().optional(),
    email: z.string().optional(),
    avatar: z.string().optional(),
    imported: z.boolean().optional(),
});

export type User = z.infer<typeof UserSchema>;
