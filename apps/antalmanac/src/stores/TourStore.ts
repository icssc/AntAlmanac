import { ReactourStep } from 'reactour';
import { create } from 'zustand';
import { addSampleClasses } from '$lib/tourExampleGeneration';

export const tourSteps: Array<ReactourStep> = [
    {
        selector: '#searchBar',
        content: 'You can search for your classes here!',
    },
    {
        selector: '#import-button',
        content: 'Quickly add your classes from WebReg or Zotcourse!',
    },
    {
        selector: '.rbc-time-view', // Calendar.
        content: 'See the classes in your schedule!',
        action: addSampleClasses,
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
