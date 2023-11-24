import { ReactourStep } from 'reactour';
import { create } from 'zustand';
import { addSampleClasses } from '$lib/tourExampleGeneration';

enum TourStepName {
    searchBar = 'searchBar',
    importButton = 'importButton',
    calendar = 'calendar',
    finalsButton = 'finalsButton',
    finalsButtonPostClick = 'finalsButtonPostClick',
}

/**
 * Exhaustive enumeration of all possible tour steps for reference.
 * The tour doesn't start with all of them.
 */
export const namedTourSteps: Record<TourStepName, ReactourStep> = {
    searchBar: {
        selector: '#searchBar',
        content: 'You can search for your classes here!',
    },
    importButton: {
        selector: '#import-button',
        content: 'Quickly add your classes from WebReg or Zotcourse!',
    },
    calendar: {
        selector: '.rbc-time-view', // Calendar.
        content: 'See the classes in your schedule!',
        action: addSampleClasses,
    },
    finalsButton: {
        selector: '#finals-button',
        content: 'Try this button!',
        action: finalsButtonAction,
    },
    finalsButtonPostClick: {
        selector: '.rbc-time-view',
        content: 'That shows your finals schedule!',
    },
};

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
        const store = useTourStore.getState();
        store.setTourFrozen(false);
        store.replaceTourStepByName(TourStepName.finalsButton, TourStepName.finalsButtonPostClick);
    });
}

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

    tourSteps: Array<ReactourStep>;
    setTourSteps: (steps: Array<ReactourStep>) => void;
    replaceTourStep: (index: number, step: ReactourStep) => void;
    replaceTourStepByName: (replacedName: TourStepName, replacementName: TourStepName) => void;
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

        tourSteps: [
            namedTourSteps.searchBar,
            namedTourSteps.importButton,
            namedTourSteps.calendar,
            namedTourSteps.finalsButton,
        ],
        setTourSteps: (steps: Array<ReactourStep>) => set({ tourSteps: steps }),
        replaceTourStep: (index: number, step: ReactourStep) => {
            set((state) => ({
                tourSteps: [...state.tourSteps.slice(0, index), step, ...state.tourSteps.slice(index + 1)],
            }));
        },
        replaceTourStepByName: (replacedName: TourStepName, replacementName: TourStepName) => {
            const index = get().tourSteps.findIndex((step) => step == namedTourSteps[replacedName]);
            if (index === -1) {
                console.error(`Could not find tour step with name ${replacedName}`);
                return;
            }
            set((state) => ({
                tourSteps: [
                    ...state.tourSteps.slice(0, index),
                    namedTourSteps[replacementName],
                    ...state.tourSteps.slice(index + 1),
                ],
            }));
        },
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
