import type { User } from '@packages/db/src/schema/auth/user';

export type Friend = Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
export type FriendRequest = Friend;
