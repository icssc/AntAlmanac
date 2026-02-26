import { type User } from '@packages/antalmanac-types';
import { users } from '@packages/db/src/schema';
import { eq } from 'drizzle-orm';

import type { DatabaseOrTransaction } from './rdsTypes';

export async function getUserById(db: DatabaseOrTransaction, userId: string) {
    return db.transaction((tx) =>
        tx
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .then((res) => res[0])
    );
}

export async function getUserByEmail(db: DatabaseOrTransaction, email: string): Promise<User | undefined> {
    return db.transaction((tx) =>
        tx
            .select()
            .from(users)
            .where(eq(users.email, email))
            .then((res) => res[0])
    );
}
