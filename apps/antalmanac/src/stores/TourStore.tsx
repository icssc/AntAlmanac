import { ReactourStep } from 'reactour';
import { create } from 'zustand';
import { addSampleClasses } from '$lib/tourExampleGeneration';

enum TourStepName {
    searchBar = 'searchBar',
    importButton = 'importButton',
    calendar = 'calendar',
    finalsButton = 'finalsButton',
    finalsButtonPostClick = 'finalsButtonPostClick',
    welcome = 'welcome',
}

/**
 * Exhaustive enumeration of all possible tour steps for reference.
 * The tour doesn't start with all of them.
 */
export const namedTourSteps: Record<TourStepName, ReactourStep> = {
    welcome: {
        content: (
            <>
                Welcome to AntAlmanac! This tour will show you how to use the app.
                <br />
                Use <kbd>←</kbd> and <kbd>→</kbd> to navigate the tour.
                <br />
                Press <kbd>Esc</kbd> to exit.
            </>
        ),
    },
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
        content: 'Guess what this does!',
        /**
         * Freezes the tour until the user presses the finals button.
         */
        action: tourActionFactory(
            () => {
                const store = useTourStore.getState();
                store.setTourFrozen(true);
            },
            () => {
                const store = useTourStore.getState();
                store.setTourFrozen(false);
                store.replaceTourStep(TourStepName.finalsButton, TourStepName.finalsButtonPostClick);
            },
            {
                selector: '#finals-button',
                eventType: 'click',
            }
        ),
    },
    finalsButtonPostClick: {
        selector: '.rbc-time-view',
        content: 'It shows your finals schedule!',
    },
};

// TODO: Document
interface TourStore {
    tourEnabled: boolean;
    setTourEnabled: (enabled: boolean) => void;
    startTour: () => void;
    endTour: () => void;

    tourFrozen: boolean;
    setTourFrozen: (frozen: boolean) => void;

    tourSteps: Array<ReactourStep>;
    setTourSteps: (steps: Array<ReactourStep>) => void;
    replaceTourStep: (replacedName: TourStepName, replacementName: TourStepName) => void;
}

// TODO: Freeze tour while allowing escape. Remove all steps except for current one.
export const useTourStore = create<TourStore>((set, get) => {
    return {
        tourEnabled: true, // TODO: Check localstorage
        setTourEnabled: (enabled: boolean) => set({ tourEnabled: enabled }),
        startTour: () => set({ tourEnabled: true }),
        endTour: () => set({ tourEnabled: false }),

        tourFrozen: false,
        setTourFrozen: (frozen: boolean) => set({ tourFrozen: frozen }),

        tourSteps: [
            namedTourSteps.welcome,
            namedTourSteps.searchBar,
            namedTourSteps.importButton,
            namedTourSteps.calendar,
            namedTourSteps.finalsButton,
        ],
        setTourSteps: (steps: Array<ReactourStep>) => set({ tourSteps: steps }),
        replaceTourStep: (replacedName: TourStepName, replacementName: TourStepName) => {
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
 *
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

//eslint-disable-next-line
type RunOnceCallable = ((domNode?: any) => void) & { _called: boolean };

/**
 * Returns a callable that runs the given function once and never again.
 *
 * @param callable Function to run once.
 * @returns The function that you can call many times.
 */
//eslint-disable-next-line
function runOneCallableFactory(callable: Function): RunOnceCallable {
    // The weirdness allows the function to have state and track if it's been called.
    const _call = () => {
        if (runOnce._called) return;
        runOnce._called = true;
        callable();
    };

    const runOnce = Object.assign(_call, { _called: false }) as RunOnceCallable;
    return runOnce;
}

/**
 * Returns a callable that can be used as a tour step action.
 *
 * @param before Function to run before waiting for the field to change.
 * @param after Function to run after the field changes to the desired value.
 * @param waitFor Field and value to watch for in the tour store.
 * @returns The function that can be used as a tour step action.
 */
function tourActionFactory(
    before?: () => void,
    after?: () => void,
    waitFor: { selector?: string; eventType?: string } = {}
) {
    const action = () => {
        if (before) before();

        if (!(waitFor?.eventType && waitFor?.selector && after)) return;

        const domNode = document.querySelector(waitFor.selector);

        if (!domNode) {
            console.error(`Could not find element with selector ${waitFor.selector}`);
            return;
        }

        domNode.addEventListener(waitFor.eventType, runOneCallableFactory(after));
    };

    return runOneCallableFactory(action);
}

export default useTourStore;
