import { z } from 'zod';

export const theme = z.enum(['light', 'dark', 'system']);
export type Theme = z.infer<typeof theme>;

export interface User {
  /**
   * google id
   */
  id: string;
  email: string;
  name: string;
  picture: string;
}

export type UserMetadata = Omit<User, 'id'>;

export interface UserData extends UserMetadata {
  id: number;
  theme: Theme;
  isAdmin: boolean;
  lastRoadmapEditAt?: string;
  currentPlanIndex?: number;
}

export interface UserSliceState {
  user: UserMetadata | null;
  theme: Theme | null;
  isAdmin: boolean;
}
