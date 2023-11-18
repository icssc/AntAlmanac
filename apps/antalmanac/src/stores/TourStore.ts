import { ReactourStep } from 'reactour';
import { create } from 'zustand';
import { addSampleClasses } from '$lib/tourExampleGeneration';

/** So that the finalsButtonAction only runs once */
let _finalsButtonActionActivated = false;
/**
 * Freezes the tour until the user presses the finals button.
 */
function finalsButtonAction() {
    // TOOD: Replace the finals button tour step to highlight the calendar pane.
    if (_finalsButtonActionActivated) return;
    _finalsButtonActionActivated = true;

    useTourStore.setState({ tourFrozen: true });
    waitForTourStoreValue('finalsButtonPressed', true).then(() => {
        useTourStore.setState({ tourFrozen: false });
    });
}

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
        action: finalsButtonAction,
    },
];

// TODO: Document
interface TourStore {
    tourEnabled: boolean;
    setTourEnabled: (enabled: boolean) => void;
    startTour: () => void;
    endTour: () => void;

    tourFrozen: boolean;
    setTourFrozen: (frozen: boolean) => void;

    finalsButtonPressed: boolean;
    markFinalsButtonPressed: () => void;
}

export const useTourStore = create<TourStore>((set, get) => {
    return {
        tourEnabled: true, // TODO: Check localstorage
        setTourEnabled: (enabled: boolean) => set({ tourEnabled: enabled }),
        startTour: () => set({ tourEnabled: true }),
        endTour: () => set({ tourEnabled: false }),

        tourFrozen: false,
        setTourFrozen: (frozen: boolean) => set({ tourFrozen: frozen }),

        finalsButtonPressed: false,
        markFinalsButtonPressed: () => set({ finalsButtonPressed: true }),
    };
});

/**
 * Returns a promise that resolve when a field in the tour store changes to the given value.
 * @param field Name of TourStore field to watch.
 * @param value Value to watch for.
 * @returns The promise that resolves when the field changes to the given value.
 */
export function waitForTourStoreValue(field: keyof TourStore, value: TourStore[keyof TourStore]): Promise<void> {
    return new Promise<void>((resolve) => {
        const unsubscribe = useTourStore.subscribe((tourStore) => {
            if (tourStore[field] === value) {
                unsubscribe();
                resolve();
            }
        });
    });
}

export default useTourStore;
