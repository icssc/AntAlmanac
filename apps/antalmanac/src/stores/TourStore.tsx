import { ReactourStep } from 'reactour';
import { create } from 'zustand';
import { addSampleClasses } from '$lib/tourExampleGeneration';

const tourHasRunKey = 'tourHasRun';

export function tourHasRun(): boolean {
    return false;
    // return localStorage.getItem(tourHasRunKey) == 'true';
}

function markTourHasRun() {
    localStorage.setItem(tourHasRunKey, 'true');
}

enum TourStepName {
    searchBar = 'searchBar',
    importButton = 'importButton',
    calendar = 'calendar',
    finalsButton = 'finalsButton',
    showFinals = 'showFinals',
    welcome = 'welcome',
    addedCoursesTab = 'addedCoursesTab',
    addedCoursePane = 'addedCoursePane',
    map = 'map',
    mapPane = 'mapPane',
    saveAndLoad = 'saveAndLoad',
}

type NamedTourSteps = Record<TourStepName, ReactourStep>;

/**
 * Exhaustive enumeration of all possible tour steps for reference.
 * The tour doesn't start with all of them.
 */
export const namedTourSteps: NamedTourSteps = {
    welcome: {
        content: (
            <>
                Welcome to AntAlmanac!
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
        action: () => markTourHasRun(),
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
        selector: '#finals-button, #finals-button-pressed',
        content: (
            <>
                <b>Click</b> to see your finals
            </>
        ),
        /** If the user presses/pressed the finals button, move to the next step */
        action: tourActionFactory(
            () => {
                useTourStore.getState().goToStep(TourStepName.showFinals);
            },
            // Only move to the next step if the button is toggled from off to on, not vice versa.
            { selector: '#finals-button', eventType: 'click' }
        ),
    },
    showFinals: {
        selector: '#calendar-root',
        content: 'See your finals on the calendar',
        /** Click the finals button if the user hasn't already */
        action: () => {
            // If the button has been clicked, we need to wait for the id to change.
            setTimeout(() => {
                document.getElementById('finals-button')?.click();
            }, 50);
        },
    },
    addedCoursesTab: {
        selector: '#added-courses-tab',
        content: (
            <>
                <b>Select</b> the added courses tab for a list of your courses and details
            </>
        ),
        action: tourActionFactory(() => useTourStore.getState().goToStep(TourStepName.addedCoursePane), {
            selector: '#added-courses-tab',
            eventType: 'click',
        }),
    },
    addedCoursePane: {
        selector: '#course-pane-box',
        content: (
            <>
                <b>Select</b> the added courses tab for a list of your courses and details
            </>
        ),
        action: () => document.getElementById('added-courses-tab')?.click(),
        mutationObservables: ['#course-pane-box'],
    },
    map: {
        selector: '#map-tab',
        content: (
            <>
                <b>Select</b> the map tab to see where your classes are.
            </>
        ),
        action: tourActionFactory(() => useTourStore.getState().goToStep(TourStepName.mapPane), {
            selector: '#map-tab',
            eventType: 'click',
        }),
    },
    mapPane: {
        selector: '#map-pane',
        content: <>Select the map tab to see where your classes are.</>,
        action: () => document.getElementById('map-tab')?.click(),
        mutationObservables: ['#map-pane'],
    },
    saveAndLoad: {
        selector: '#load-save-container',
        content: (
            <>
                <b>Save</b> your schedule when you&apos;re done. <br />
                <b>Load</b> your schedule when you need it again. <br />
                <hr />
                That&apos;s it 🎉 Good luck with your classes!
            </>
        ),
        action: tourActionFactory(() => useTourStore.getState().goToStep(TourStepName.saveAndLoad), {
            selector: '#load-save-container',
            eventType: 'click',
        }),
    },
};

// TODO: Document
interface TourStore {
    tourEnabled: boolean;
    setTourEnabled: (enabled: boolean) => void;
    startTour: () => void;
    endTour: () => void;

    tourSteps: Array<ReactourStep>;

    step: number;
    setStep: (step: number) => void;
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (stepName: TourStepName) => void;
}

export const useTourStore = create<TourStore>((set, get) => {
    return {
        tourEnabled: !tourHasRun(),
        setTourEnabled: (enabled: boolean) => set({ tourEnabled: enabled }),
        startTour: () => set({ tourEnabled: true }),
        endTour: () => set({ tourEnabled: false }),

        tourSteps: Object.values(namedTourSteps),
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

        step: 0,
        setStep: (step: number) => set({ step: step }),
        nextStep: () => set((state) => ({ step: state.step + 1 })),
        previousStep: () => set((state) => ({ step: state.step - 1 })),
        goToStep: (stepName: TourStepName) => {
            const index = get().tourSteps.findIndex((step) => step == namedTourSteps[stepName]);
            if (index === -1) {
                console.error(`Could not find tour step with name ${stepName}`);
                return;
            }
            set({ step: index });
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
 * @param func Function to run after the field changes to the desired value.
 * @param waitFor Field and value to watch for in the tour store.
 * @returns The function that can be used as a tour step action.
 */
function tourActionFactory(func: () => void, waitFor: { selector?: string; eventType?: string } = {}) {
    const action = () => {
        if (!(waitFor?.eventType && waitFor?.selector && func)) return;

        const domNode = document.querySelector(waitFor.selector);

        if (!domNode) {
            console.error(`Could not find element with selector ${waitFor.selector}`);
            return;
        }

        domNode.addEventListener(waitFor.eventType, runOneCallableFactory(func));
    };

    return runOneCallableFactory(action);
}

export default useTourStore;
