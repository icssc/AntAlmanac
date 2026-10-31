import generatedMajors from '$generated/majors.json';
import { trpc } from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { SchoolSchema } from '@packages/antalmanac-types';
import type { School } from '@packages/antalmanac-types';
import { create } from 'zustand';

const ALL_MAJORS: Record<string, string> = generatedMajors;

interface UserInfoStore {
    initialized: boolean;
    majors: string[];
    schools: School[];
    loadUserInfo: () => Promise<void>;
    setMajorSchools: (majors: string[], schools: School[]) => Promise<void>;
}

export const useUserInfoStore = create<UserInfoStore>((set, get) => ({
    initialized: false,
    majors: [],
    schools: [],

    loadUserInfo: async () => {
        const { sessionIsValid } = useSessionStore.getState();
        if (!sessionIsValid) {
            set({ majors: [], schools: [], initialized: true });
            return;
        }

        try {
            const userInfo = await trpc.user.get.query();

            const majors = (userInfo?.majors ?? []).filter((major) => major in ALL_MAJORS);

            const schools = (userInfo?.schools ?? []).filter(
                (school): school is School => SchoolSchema.safeParse(school).success
            );
            set({
                majors,
                schools,
                initialized: true,
            });
        } catch (error) {
            console.error('Failed to load user info:', error);
            set({ initialized: true });
        }
    },

    setMajorSchools: async (majors, schools) => {
        const previous = { major: get().majors, schools: get().schools };
        set({ majors, schools });

        try {
            await trpc.user.updateMajorSchools.mutate({ majors, schools });
        } catch (error) {
            console.error('Failed to save major and school:', error);
            set(previous);
            openSnackbar('error', 'Could not save major and school. Please try again.');
        }
    },
}));
