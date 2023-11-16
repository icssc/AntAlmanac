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
    {
        selector: '#finals-button',
        content: 'See your finals times',
    },
];

interface TourStore {
    tourEnabled: boolean;
    setTourEnabled: (enabled: boolean) => void;
    enableTour: () => void;
    disableTour: () => void;
}

export const useTourStore = create<TourStore>((set, get) => {
    return {
        tourEnabled: true, // TODO: Check localstorage
        setTourEnabled: (enabled: boolean) => set({ tourEnabled: enabled }),
        enableTour: () => set({ tourEnabled: true }),
        disableTour: () => set({ tourEnabled: false }),
    };
});

export default useTourStore;
