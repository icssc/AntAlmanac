import { create } from 'zustand';

export interface TimeFormatStore {
    timeFormat: boolean;
    setTimeFormat: (militaryTime: boolean) => void;
}

export const useTimeFormatStore = create<TimeFormatStore>((set) => {
    const timeFormat = !(typeof Storage !== 'undefined' && window.localStorage.getItem('show24HourTime') === 'true');

    return {
        timeFormat,
        setTimeFormat: (timeFormat) => {
            if (typeof Storage !== 'undefined') {
                window.localStorage.setItem('show24HourTime', timeFormat.toString());
            }
            set({ timeFormat });
        },
    };
});
