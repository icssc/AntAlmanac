/** Step order is the enum's declaration order. Jump between steps by name, never by index. */
export enum TourStepName {
    welcome = 'welcome',
    year = 'year',
    transferCredits = 'transferCredits',
    importYear = 'importYear',
    roadmapName = 'roadmapName',
    roadmapMenu = 'roadmapMenu',
    selectMajor = 'selectMajor',
    majorRequirements = 'majorRequirements',
    dragCourse = 'dragCourse',
    clickCourseTitle = 'clickCourseTitle',
    coursePreview = 'coursePreview',
    customEvents = 'customEvents',
    exitPreview = 'exitPreview',
    goToLibrary = 'goToLibrary',
    clickPlus = 'clickPlus',
    customCardDetails = 'customCardDetails',
    celebrate = 'celebrate',
}

export const tourStepNames = Object.values(TourStepName);

export function stepIndex(name: TourStepName): number {
    return tourStepNames.indexOf(name);
}

/** Selector that matches nothing, so the step has no highlight and the whole page is dimmed. */
export const NO_TARGET = '[data-tour="none"]';

/** Elements the tour highlights. Each is marked with a matching `data-tour` attribute. */
export const TOUR_TARGET = {
    roadmapName: '[data-tour="roadmap-name"]',
    roadmapMenu: '[data-tour="roadmap-menu"]',
    majorSelect: '[data-tour="major-select"]',
    sidebar: '[data-tour="sidebar"]',
    sidebarContent: '[data-tour="sidebar-content"]',
    creditsTab: '[data-tour="credits-tab"]',
    catalogTab: '[data-tour="catalog-tab"]',
    /** The first quarter of the first year, i.e. Fall. */
    firstQuarter: '.quarter',
    coursePreview: '[data-tour="course-preview"]',
    previewClose: '[data-tour="preview-close"]',
    libraryTab: '.requirements-list-selector [data-tab="Library"]',
    customCards: '[data-tour="custom-cards"]',
    addCustomCard: '[data-tour="add-custom-card"]',
} as const;

const TOUR_HAS_RUN_KEY = 'roadmap__tutorial_has_run';

export function markTourHasRun() {
    localStorage.setItem(TOUR_HAS_RUN_KEY, 'true');
}

function tourParam(): string | null {
    return new URLSearchParams(window.location.search).get('tour');
}

/** Only run the tour on desktop, and only if it hasn't run before. `?tour` in the URL forces it. */
export function tourShouldRun(): boolean {
    if (typeof window === 'undefined') return false;
    if (tourParam() !== null) return true;
    return localStorage.getItem(TOUR_HAS_RUN_KEY) !== 'true' && !window.matchMedia('(max-width: 799px)').matches;
}

/** `?tour=<step name>` opens the tour at that step, e.g. `?tour=year`. */
export function initialTourStep(): number {
    return Math.max(tourStepNames.indexOf(tourParam() as TourStepName), 0);
}

interface WaitOptions {
    timeoutMs?: number;
    onTimeout?: () => void;
}

/** Polls every frame until `isReady` returns true, then calls `onReady`. */
function waitFor(isReady: () => boolean, onReady: () => void, { timeoutMs = 3000, onTimeout }: WaitOptions = {}) {
    const startedAt = performance.now();
    const tick = () => {
        if (isReady()) {
            onReady();
        } else if (performance.now() - startedAt > timeoutMs) {
            onTimeout?.();
        } else {
            requestAnimationFrame(tick);
        }
    };
    requestAnimationFrame(tick);
}

/**
 * Calls `onReady` once the element exists and has finished animating into place, e.g. a menu that
 * has finished opening. Highlighting it any earlier would measure it mid-animation.
 */
export function waitForStableRect(selector: string, onReady: () => void, options?: WaitOptions) {
    // An opening animation can hold its start frame for a moment, so require several still frames.
    const STILL_FRAMES = 5;
    let previous = '';
    let stillFrames = 0;

    const isStill = () => {
        const el = document.querySelector(selector);
        const rect = el?.getBoundingClientRect();
        const current = rect?.width && rect.height ? `${rect.x},${rect.y},${rect.width},${rect.height}` : '';
        const animating = !!el?.getAnimations().length;
        stillFrames = current && current === previous && !animating ? stillFrames + 1 : 0;
        previous = current;
        return stillFrames >= STILL_FRAMES;
    };

    waitFor(isStill, onReady, options);
}

export function waitForRemoval(selector: string, onRemoved: () => void, options?: WaitOptions) {
    waitFor(() => !document.querySelector(selector), onRemoved, options);
}

export function clickElement(selector: string) {
    document.querySelector<HTMLElement>(selector)?.click();
}
