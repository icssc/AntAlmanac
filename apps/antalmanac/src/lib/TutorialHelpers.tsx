import { StepType } from '@reactour/tour';
import useTabStore from '$stores/TabStore';
import { addSampleClasses } from '$lib/tourExampleGeneration';

export enum TourStepName {
    welcome = 'welcome',
    searchBar = 'searchBar',
    importButton = 'importButton',
    calendar = 'calendar',
    finalsButton = 'finalsButton',
    showFinals = 'showFinals',
    addedCoursesTab = 'addedCoursesTab',
    addedCoursePane = 'addedCoursePane',
    map = 'map',
    mapPane = 'mapPane',
    saveAndLoad = 'saveAndLoad',
}

// Preserves ordering of steps as defined in enum.
export const tourStepNames = Object.values(TourStepName);

const tourHasRunKey = 'tourHasRun';

function markTourHasRun() {
    localStorage.setItem(tourHasRunKey, 'true');
}

/** Only run tour if it hasn't run before, we're on desktop, and there isn't a user ID saved */
export function tourShouldRun(): boolean {
    return !(
        localStorage.getItem(tourHasRunKey) == 'true' ||
        window.matchMedia('(max-width: 768px)').matches ||
        localStorage.getItem('userID') != null
    );
}

function KbdCard(props: { children?: React.ReactNode }) {
    return (
        <div
            style={{
                borderRadius: '0.25rem',
                border: '1px solid #ccc',
                backgroundColor: '#f7f7f7',
                display: 'inline',
                verticalAlign: 'middle',
                textAlign: 'center',
                fontFamily: 'monospace',
                padding: '0.05rem 0.3rem',
            }}
        >
            {props.children}
        </div>
    );
}

export function namedStepsFactory(goToStep: (step: number) => void): Record<TourStepName, StepType> {
    const setTab = useTabStore.getState().setActiveTab;

    const goToNamedStep = (stepName: TourStepName) => {
        const stepIndex = tourStepNames.findIndex((step) => step == stepName);

        if (stepIndex == -1) {
            console.error(`Could not find step with name ${stepName}`);
            return;
        }

        goToStep(stepIndex);
    };

    return {
        welcome: {
            selector: '#root',
            content: (
                <>
                    Welcome to AntAlmanac!
                    <br />
                    Use <KbdCard>←</KbdCard> and <KbdCard>→</KbdCard> to navigate the tour.
                    <br />
                    Press <KbdCard>Esc</KbdCard> to exit.
                    <hr />
                    You can always review the tour by clicking the button in the bottom right corner.
                </>
            ),
            actionAfter: () => {
                markTourHasRun();
            },
        },
        searchBar: {
            selector: '#searchBar',
            content: 'You can search for your classes here!',
            action: () => {
                markTourHasRun();
                setTab(0);
            },
            mutationObservables: ['#searchBar'],
        },
        importButton: {
            selector: '#import-button',
            content: 'Quickly add your classes from WebReg or Zotcourse!',
        },
        calendar: {
            selector: '.rbc-time-view', // Calendar.
            content: 'See the classes in your schedule!',
            action: () => {
                addSampleClasses();
                const finalsButtonPressed = document.getElementById('finals-button-pressed');
                if (!finalsButtonPressed) return;
                finalsButtonPressed.click(); // To switch back to normal view
            },
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
                    goToNamedStep(TourStepName.showFinals);
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
            actionAfter: () => {
                // Switch back to normal calendar
                setTimeout(() => {
                    document.getElementById('finals-button-pressed')?.click();
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
            action: tourActionFactory(() => goToNamedStep(TourStepName.addedCoursePane), {
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
            action: () => setTab(1),
            mutationObservables: ['#course-pane-box'],
        },
        map: {
            selector: '#map-tab',
            content: (
                <>
                    <b>Select</b> the map tab to see where your classes are.
                </>
            ),
            action: tourActionFactory(() => goToNamedStep(TourStepName.mapPane), {
                selector: '#map-tab',
                eventType: 'click',
            }),
        },
        mapPane: {
            selector: '#map-pane',
            content: 'Click on a day to see your route!',
            action: () => setTab(2),
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
            action: tourActionFactory(() => goToNamedStep(TourStepName.saveAndLoad), {
                selector: '#load-save-container',
                eventType: 'click',
            }),
        },
    };
}

export function stepsFactory(goToStep: (step: number) => void): Array<StepType> {
    const namedSteps = namedStepsFactory(goToStep);
    // Preserve the order of the steps.
    return tourStepNames.map((key: TourStepName) => namedSteps[key]);
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
            console.info(`Could not find element with selector ${waitFor.selector}`);
            return;
        }

        domNode.addEventListener(waitFor.eventType, runOneCallableFactory(func));
    };

    return runOneCallableFactory(action);
}
