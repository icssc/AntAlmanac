'use client';

import type { StepType } from '@reactour/tour';
import type { CSSProperties } from 'react';

import { clickElement, NO_TARGET, TOUR_TARGET, TourStepName, tourStepNames } from './tutorialConfig';
import { tutorialMascots } from './tutorialMascots';
import { TutorialPopover, type TourStepConfig } from './TutorialPopover';

/**
 * Shared popover look. Reactour replaces the provider's `popover` style with a step's rather than
 * merging them, so every step's popover style has to include this.
 */
export const basePopoverStyle: CSSProperties = {
    backgroundColor: 'var(--mui-palette-overlay-overlay3)',
    color: 'var(--mui-palette-text-primary)',
    boxShadow: '0 0 10px #000',
    boxSizing: 'border-box',
    // Steps set their own size and padding; the column layout lets the content fill it.
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 'none',
    padding: 0,
    overflow: 'visible',
};

// The roadmap button toggles the menu, so clicking it again closes the menu.
const closeRoadmapMenu = () => clickElement(TOUR_TARGET.roadmapName);

// Custom cards are saved to the user's account, so the Library only shows the "+" button when
// logged in. Logged-out users skip the custom card steps.
const hasCustomCards = () => !!document.querySelector(TOUR_TARGET.addCustomCard);

/* Mascot placements are computed from where the art sits inside each PNG and where the Figma
 * frame puts it, relative to the popover's inner edge. */

const tourSteps: Record<TourStepName, TourStepConfig> = {
    [TourStepName.welcome]: {
        width: 366,
        minHeight: 240,
        borderRadius: 13,
        borderWidth: 2,
        padding: '28px 24px 32px',
        variant: 'welcome',
        title: 'Welcome to Planner!',
        text: (
            <>
                Would you like Peter to
                <br />
                show you around?
            </>
        ),
        mascot: {
            src: tutorialMascots.over,
            style: { width: 280, top: -142, left: '50%', transform: 'translateX(-50%)' },
        },
        buttons: [{ label: 'Yes', goTo: TourStepName.year }, { label: 'No' }],
    },
    [TourStepName.year]: {
        width: 296,
        minHeight: 160,
        padding: '28px 40px 30px',
        text: (
            <>
                Is this your 1st year at
                <br />
                UCI?
            </>
        ),
        mascot: { src: tutorialMascots.thinking, style: { width: 279, right: -201, bottom: -159 } },
        buttons: [
            { label: 'Yes', goTo: TourStepName.transferCredits },
            { label: 'No', goTo: TourStepName.importYear },
        ],
    },
    [TourStepName.transferCredits]: {
        width: 296,
        minHeight: 162,
        target: TOUR_TARGET.creditsTab,
        position: ({ left, bottom }) => [left + 98, bottom + 106],
        outline: true,
        // The tab is a full-height cell; the design outlines just its icon and label.
        highlightPadding: [-14, -7, -16, -13],
        padding: '24px 30px 27px',
        text: (
            <>
                If you have any transfer
                <br />
                credits, add them here!
            </>
        ),
        mascot: {
            src: tutorialMascots.teach,
            // Clipped where it would overlap the popover, so Peter looks to be standing behind it.
            style: { width: 275, left: -108, top: -159, clipPath: 'inset(0 0 102px 0)' },
        },
        buttons: [
            { label: 'Back', goTo: TourStepName.year },
            {
                label: 'Next',
                goTo: TourStepName.selectMajor,
                // The Credits tab is clickable here; the major selector lives on the Catalog tab.
                before: () => clickElement(TOUR_TARGET.catalogTab),
            },
        ],
        buttonGap: 27,
    },
    [TourStepName.importYear]: {
        width: 296,
        minHeight: 183,
        padding: '28px 40px 30px',
        text: (
            <>
                Would you like to import
                <br />
                your previous year?
            </>
        ),
        mascot: { src: tutorialMascots.thinking, style: { width: 279, left: -157, bottom: -143 } },
        buttons: [
            { label: 'Yes', goTo: TourStepName.roadmapName },
            // Nothing to import, so skip the roadmap menu and go straight to choosing a major.
            { label: 'No', goTo: TourStepName.selectMajor },
        ],
        progress: 0.2,
    },
    [TourStepName.roadmapName]: {
        width: 304,
        minHeight: 92,
        target: TOUR_TARGET.roadmapName,
        position: ({ right, top }) => [right + 93, top - 10],
        outline: true,
        padding: '21px 36px',
        text: (
            <>
                Click on the name of your
                <br />
                roadmap.
            </>
        ),
        mascot: { src: tutorialMascots.teach, style: { width: 275, left: -146, top: -14 } },
        // Advances when the user opens the roadmap menu, once it has finished opening.
        advanceOn: { click: TOUR_TARGET.roadmapName, waitFor: TOUR_TARGET.roadmapMenu, goTo: TourStepName.roadmapMenu },
    },
    [TourStepName.roadmapMenu]: {
        width: 315,
        minHeight: 200,
        target: TOUR_TARGET.roadmapMenu,
        position: ({ right, top }) => [right + 71, top + 9],
        outline: true,
        observe: [TOUR_TARGET.roadmapMenu],
        padding: '24px 30px 25px',
        text: (
            <>
                These options allow you to
                <br />
                import preexisting
                <br />
                schedules as well as create
                <br />
                new ones!
            </>
        ),
        mascot: { src: tutorialMascots.wave, style: { width: 271, left: -127, bottom: -225 } },
        buttons: [
            { label: 'Back', goTo: TourStepName.roadmapName, before: closeRoadmapMenu },
            { label: 'Next', goTo: TourStepName.selectMajor, before: closeRoadmapMenu },
        ],
    },
    [TourStepName.selectMajor]: {
        width: 387,
        minHeight: 159,
        target: TOUR_TARGET.majorSelect,
        position: ({ right, bottom }) => [right + 97, bottom + 8],
        outline: true,
        padding: '22px 30px 24px',
        text: (
            <>
                Click on the drop down or type
                <br />
                to enter your major
            </>
        ),
        mascot: { src: tutorialMascots.teach, style: { width: 307, left: -229, top: -54 } },
        buttons: [
            // TODO: where "Undeclared/Skip" leads, once it's designed.
            { label: 'Undeclared/Skip' },
            { label: 'Next', goTo: TourStepName.majorRequirements },
        ],
        buttonGap: 23,
        // The options list opens below the highlighted input, so lift it above the overlay.
        htmlClass: 'tutorial-raise-major-options',
    },
    [TourStepName.majorRequirements]: {
        width: 377,
        minHeight: 185,
        target: TOUR_TARGET.sidebarContent,
        position: ({ right, top }) => [right + 78, top + 124],
        padding: '23px 30px 30px',
        text: (
            <>
                These are all your requirements for
                <br />
                your major! You can click on the
                <br />
                drop-downs to view the courses.
            </>
        ),
        mascot: { src: tutorialMascots.teach, style: { width: 285, left: -157, top: 31 } },
        buttons: [
            { label: 'Back', goTo: TourStepName.selectMajor },
            { label: 'Next', goTo: TourStepName.dragCourse },
        ],
        buttonGap: 28,
    },
    [TourStepName.dragCourse]: {
        width: 377,
        minHeight: 204,
        target: TOUR_TARGET.firstQuarter,
        position: ({ left, bottom }) => [left - 9, bottom + 79],
        outline: true,
        observe: [TOUR_TARGET.firstQuarter],
        padding: '20px 30px 27px',
        text: (
            <>
                Now you can select and drag the
                <br />
                classes you would like to take to
                <br />
                your desired quarter. Here let’s try
                <br />
                dragging this class to fall quarter!
            </>
        ),
        mascot: { src: tutorialMascots.wave, style: { width: 273, left: 324, top: -147 } },
        buttons: [
            { label: 'Back', goTo: TourStepName.majorRequirements },
            { label: 'Next', goTo: TourStepName.clickCourseTitle },
        ],
        buttonGap: 36,
        // Fall is the highlighted drop target; courses are dragged from the sidebar, so lift it too.
        htmlClass: 'tutorial-raise-sidebar',
    },
    [TourStepName.clickCourseTitle]: {
        width: 308,
        minHeight: 97,
        target: TOUR_TARGET.firstQuarter,
        position: ({ left, bottom }) => [left + 128, bottom + 46],
        outline: true,
        observe: [TOUR_TARGET.firstQuarter],
        padding: '23px 30px 24px',
        text: (
            <>
                Now, let’s try clicking on
                <br />
                the course title!
            </>
        ),
        mascot: { src: tutorialMascots.wave, style: { width: 258, left: 205, top: -5 } },
        // Advances once clicking a course title has opened its preview.
        advanceOn: {
            click: `${TOUR_TARGET.firstQuarter} .course .name`,
            waitFor: TOUR_TARGET.coursePreview,
            goTo: TourStepName.coursePreview,
        },
    },
    [TourStepName.coursePreview]: {
        width: 377,
        minHeight: 162,
        target: TOUR_TARGET.coursePreview,
        position: ({ left, top }) => [left - 297, top + 173],
        padding: '26px 30px 27px',
        text: (
            <>
                This page contains all the
                <br />
                information you’ll need for the class
            </>
        ),
        mascot: {
            src: tutorialMascots.over,
            // Mirrored, so Peter faces the preview.
            style: { width: 258, left: 203, top: -139, transform: 'scaleX(-1)' },
        },
        buttons: [
            {
                label: 'Back',
                goTo: TourStepName.clickCourseTitle,
                before: () => clickElement(TOUR_TARGET.previewClose),
            },
            { label: 'Next', goTo: TourStepName.customEvents },
        ],
        buttonGap: 38,
    },
    [TourStepName.customEvents]: {
        width: 377,
        minHeight: 152,
        padding: '23px 30px 27px',
        text: (
            <>
                Are there any custom events/classes
                <br />
                you would like to add to your planner?
            </>
        ),
        mascot: { src: tutorialMascots.wave, style: { width: 265, left: 254, top: 44 } },
        buttons: [
            // TODO: where "No" leads, once it's designed.
            { label: 'No' },
            { label: 'Next', goTo: TourStepName.exitPreview },
        ],
        buttonGap: 35,
    },
    [TourStepName.exitPreview]: {
        width: 242,
        minHeight: 83,
        target: TOUR_TARGET.previewClose,
        // From the button's center, so Peter's pointer stays on it.
        position: ({ left, right, top, bottom }) => [(left + right) / 2 - 208, (top + bottom) / 2 + 144],
        padding: '16px 20px 17px',
        text: (
            <>
                Let’s exit to go back
                <br />
                to the home page
            </>
        ),
        mascot: { src: tutorialMascots.teach, style: { width: 307, left: 141, top: -181 } },
        advanceOn: {
            click: TOUR_TARGET.previewClose,
            waitForRemoval: TOUR_TARGET.coursePreview,
            goTo: TourStepName.goToLibrary,
        },
    },
    [TourStepName.goToLibrary]: {
        width: 242,
        minHeight: 65,
        target: TOUR_TARGET.sidebar,
        position: ({ left, top }) => [left + 250, top + 243],
        padding: '19px 20px 20px',
        text: 'Now, let’s go to Library',
        mascot: {
            src: tutorialMascots.teach,
            // Clipped where it would overlap the popover, so Peter looks to be standing behind it.
            style: { width: 307, left: 40, top: -197, clipPath: 'inset(0 0 94px 0)' },
        },
        advanceOn: {
            click: TOUR_TARGET.libraryTab,
            // The Custom Cards section shows either way; whether it has a "+" decides the next step.
            waitFor: TOUR_TARGET.customCards,
            goTo: () => (hasCustomCards() ? TourStepName.clickPlus : TourStepName.celebrate),
            closeOnTimeout: true,
        },
    },
    [TourStepName.clickPlus]: {
        width: 242,
        minHeight: 65,
        target: TOUR_TARGET.addCustomCard,
        position: ({ left, bottom }) => [left + 188, bottom + 132],
        mask: false,
        padding: '19px 20px 20px',
        text: 'Click the “+” button',
        mascot: {
            src: tutorialMascots.teach,
            style: { width: 310, left: 7, top: -185, clipPath: 'inset(0 0 109px 0)' },
        },
        advanceOn: {
            click: TOUR_TARGET.addCustomCard,
            waitFor: TOUR_TARGET.customCards,
            goTo: TourStepName.customCardDetails,
        },
    },
    [TourStepName.customCardDetails]: {
        width: 391,
        minHeight: 162,
        target: TOUR_TARGET.customCards,
        position: ({ left, bottom }) => [left + 124, bottom + 56],
        mask: false,
        observe: [TOUR_TARGET.customCards],
        padding: '26px 30px 28px',
        text: (
            <>
                Here you can input the details. When
                <br />
                you’re done, drag it into your planner!
            </>
        ),
        mascot: { src: tutorialMascots.wave, style: { width: 299, left: 310, top: -179 } },
        buttons: [
            { label: 'Skip', goTo: TourStepName.celebrate },
            { label: 'Next', goTo: TourStepName.celebrate },
        ],
        buttonGap: 43,
    },
    [TourStepName.celebrate]: {
        width: 377,
        minHeight: 172,
        padding: '30px 30px 29px',
        text: (
            <>
                That wraps up the tutorial! You’re all
                <br />
                set to create your plan at UCI!
            </>
        ),
        mascot: { src: tutorialMascots.celebrate, style: { width: 262, left: 258, top: 38 } },
        buttons: [
            {
                label: 'Back',
                goTo: () => (hasCustomCards() ? TourStepName.customCardDetails : TourStepName.goToLibrary),
            },
            { label: 'Let’s go' },
        ],
        buttonGap: 27,
    },
};

/** Turns a step's config into the step object reactour expects. */
function toReactourStep(config: TourStepConfig): StepType {
    const {
        target,
        position = 'center',
        outline = false,
        highlightPadding,
        mask = true,
        observe,
        width,
        minHeight,
        borderRadius = 10,
        borderWidth = 1,
    } = config;

    return {
        selector: target ?? NO_TARGET,
        position,
        // Highlights hug the element, as in the designs.
        padding: target ? { mask: highlightPadding ?? 0 } : undefined,
        resizeObservables: observe,
        content: <TutorialPopover config={config} />,
        styles: {
            popover: (base) => ({
                ...base,
                ...basePopoverStyle,
                width,
                minHeight,
                borderRadius,
                border: `${borderWidth}px solid rgba(184, 184, 184, 0.5)`,
            }),
            ...(outline && {
                // Click-through, so the highlighted element stays usable.
                highlightedArea: (base) => ({
                    ...base,
                    display: 'block',
                    pointerEvents: 'none',
                    stroke: 'var(--mui-palette-secondary-main)',
                    strokeWidth: 1,
                    rx: 5,
                }),
            }),
            ...(!mask && { maskWrapper: (base) => ({ ...base, display: 'none' }) }),
        },
    };
}

export function createTourSteps(): StepType[] {
    return tourStepNames.map((name) => toReactourStep(tourSteps[name]));
}
