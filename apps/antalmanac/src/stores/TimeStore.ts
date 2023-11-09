import { create } from 'zustand';

export interface TimeFormatStore {
    isMilitaryTime: boolean;
    setTimeFormat: (militaryTime: boolean) => void;
}

export const useTimeFormatStore = create<TimeFormatStore>((set) => {
    const isMilitaryTime = typeof Storage !== 'undefined' && window.localStorage.getItem('show24HourTime') == 'true';

    return {
        isMilitaryTime,
        setTimeFormat: (isMilitaryTime) => {
            if (typeof Storage !== 'undefined') {
                window.localStorage.setItem('show24HourTime', isMilitaryTime.toString());
            }
            set({ isMilitaryTime });
        },
    };
});
