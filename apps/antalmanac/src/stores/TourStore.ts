import { ReactourStep } from 'reactour';
import { create } from 'zustand';

export const tourSteps: Array<ReactourStep> = [
    {
        selector: '#searchBar',
        content: 'Search for your classes here!',
    },
    {
        selector: '.rbc-time-view', // Calendar.
        content: 'See the classes in your schedule!',
    },
];

interface TourStore {
    tourEnabled: boolean;
    setTourEnabled: (state: boolean) => void;
}

export const useTourStore = create<TourStore>((set, get) => {
    return {
        tourEnabled: true, // TODO: Check localstorage
        setTourEnabled: (state: boolean) => {
            set(() => {
                return { tourEnabled: state };
            });
        },
    };
});
