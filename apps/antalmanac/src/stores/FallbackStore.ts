import { create } from 'zustand';

interface FallbackStore {
    fallback: boolean;
    setFallback: (value: boolean) => void;
}

export const useFallbackStore = create<FallbackStore>((set) => {
    return {
        fallback: false,
        setFallback: (value: boolean) => {
            set(() => ({
                fallback: value,
            }));
        },
    };
});
