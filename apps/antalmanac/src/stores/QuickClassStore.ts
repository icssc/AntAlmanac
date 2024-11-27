import { create } from 'zustand';

interface QuickClassStore {
    value: string;
    setValue: (newValue: string) => void;
}
export const useQuickClassStore = create<QuickClassStore>((set) => ({
    value: '', // Initial value of the string
    setValue: (newValue: string) => {
        set(() => ({
            value: newValue, // Update the string value
        }));
    },
}));
