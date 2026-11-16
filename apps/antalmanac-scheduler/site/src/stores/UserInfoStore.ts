import generatedMajors from '$generated/majors.json';
import { trpc } from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { create } from 'zustand';

const ALL_MAJORS: Record<string, string> = generatedMajors;

interface UserInfoStore {
    initialized: boolean;
    majors: string[];
    loadUserInfo: () => Promise<void>;
    setMajors: (majors: string[]) => Promise<void>;
}

let latestSaveId = 0;

export const useUserInfoStore = create<UserInfoStore>((set, get) => ({
    initialized: false,
    majors: [],

    loadUserInfo: async () => {
        const { sessionIsValid } = useSessionStore.getState();
        if (!sessionIsValid) {
            set({ majors: [], initialized: true });
            return;
        }

        try {
            const userInfo = await trpc.user.get.query();

            const majors = (userInfo ?? []).filter((major) => Object.hasOwn(ALL_MAJORS, major));

            set({
                majors,
                initialized: true,
            });
        } catch (error) {
            console.error('Failed to load user info:', error);
            set({ initialized: true });
        }
    },

    setMajors: async (majors) => {
        const saveId = ++latestSaveId;
        const previous = { majors: get().majors };
        set({ majors });

        try {
            await trpc.user.updateMajors.mutate({ majors });
        } catch (error) {
            console.error('Failed to save majors:', error);
            if (saveId !== latestSaveId) return;
            set(previous);
            openSnackbar('error', 'Could not save majors. Please try again.');
        }
    },
}));
