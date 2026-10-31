import { trpc } from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { SchoolSchema } from '@packages/antalmanac-types';
import type { School } from '@packages/antalmanac-types';
import { create } from 'zustand';

interface UserInfoStore {
    initialized: boolean;
    major: string | null;
    schools: School[];
    loadUserInfo: () => Promise<void>;
    setMajorSchools: (major: string, schools: School[]) => Promise<void>;
}

export const useUserInfoStore = create<UserInfoStore>((set, get) => ({
    initialized: false,
    major: null,
    schools: [],

    loadUserInfo: async () => {
        const { sessionIsValid } = useSessionStore.getState();
        if (!sessionIsValid) {
            set({ major: null, schools: [], initialized: true });
            return;
        }

        try {
            const userInfo = await trpc.user.get.query();
            const schools = (userInfo?.schools ?? []).filter(
                (school): school is School => SchoolSchema.safeParse(school).success
            );
            set({
                major: userInfo?.major ?? null,
                schools,
                initialized: true,
            });
        } catch (error) {
            console.error('Failed to load user info:', error);
            set({ initialized: true });
        }
    },

    setMajorSchools: async (major, schools) => {
        const previous = { major: get().major, schools: get().schools };
        set({ major, schools });

        try {
            await trpc.user.updateMajorSchools.mutate({ major, schools });
        } catch (error) {
            console.error('Failed to save major and school:', error);
            set(previous);
            openSnackbar('error', 'Could not save major and school. Please try again.');
        }
    },
}));
