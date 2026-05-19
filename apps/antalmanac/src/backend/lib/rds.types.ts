import type { User, UserProfile } from '@packages/db/src/schema/auth/user';

export type Friend = Pick<User, 'id'> & UserProfile;
export type FriendRequest = Friend;
