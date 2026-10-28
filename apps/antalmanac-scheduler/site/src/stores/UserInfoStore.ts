import { trpc } from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { SchoolSchema } from '@packages/antalmanac-types';
import { type z } from 'zod';
import { create } from 'zustand';

type School = z.infer<typeof SchoolSchema>;

interface UserInfoStore {
    initialized: boolean;
    major: string | null;
    school: School | null;
    loadUserInfo: () => Promise<void>;
    setMajorSchool: (major: string, school: School) => Promise<void>;
}

export const useUserInfoStore = create<UserInfoStore>((set, get) => ({
    initialized: false,
    major: null,
    school: null,

    loadUserInfo: async () => {
        const { sessionIsValid } = useSessionStore.getState();
        if (!sessionIsValid) {
            set({ major: null, school: null, initialized: true });
            return;
        }

        try {
            const userInfo = await trpc.user.get.query();
            const school = SchoolSchema.safeParse(userInfo?.school);
            set({
                major: userInfo?.major ?? null,
                school: school.success ? school.data : null,
                initialized: true,
            });
        } catch (error) {
            console.error('Failed to load user info:', error);
            set({ initialized: true });
        }
    },

    setMajorSchool: async (major, school) => {
        const previous = { major: get().major, school: get().school };
        set({ major, school });

        try {
            await trpc.user.updateMajorSchool.mutate({ major, school });
        } catch (error) {
            console.error('Failed to save major and school:', error);
            set(previous);
            openSnackbar('error', 'Could not save major and school. Please try again.');
        }
    },
}));
