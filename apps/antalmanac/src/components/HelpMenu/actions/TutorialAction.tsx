import { HelpMenuAction } from "$components/HelpMenu/HelpMenu";
import { removeSampleClasses } from "$lib/tourExampleGeneration";
import { stepsFactory, tourShouldRun } from "$lib/TutorialHelpers";
import { useCoursePaneStore } from "$stores/CoursePaneStore";
import { PlayLesson } from "@mui/icons-material";
import { useTour } from "@reactour/tour";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export function TutorialAction(): HelpMenuAction {
    const { setCurrentStep, setIsOpen, setSteps, isOpen } = useTour();
    const [displaySearch, disableManualSearch] = useCoursePaneStore(
        useShallow((state) => [state.displaySearch, state.disableManualSearch]),
    );

    const handleClick = useCallback(() => {
        displaySearch();
        disableManualSearch();
        setCurrentStep(0);
        setIsOpen(true);
    }, [displaySearch, disableManualSearch, setCurrentStep, setIsOpen]);

    useEffect(() => setIsOpen(tourShouldRun), [setIsOpen]);

    // Remove sample classes when the tour is closed.
    useEffect(() => {
        return () => {
            removeSampleClasses();
        };
    }, [isOpen]);

    useEffect(() => {
        if (setSteps == null || setCurrentStep == null) {
            return;
        }

        setSteps(stepsFactory(setCurrentStep));
    }, [setCurrentStep, setSteps]);

    return {
        icon: <PlayLesson />,
        name: "Start Tutorial",
        disableOnMobile: true,
        onClick: handleClick,
    };
}
