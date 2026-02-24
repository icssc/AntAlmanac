import { HelpMenuAction } from "$components/HelpMenu/HelpMenu";
import { useCoursePaneStore } from "$stores/CoursePaneStore";
import { useHelpMenuStore } from "$stores/HelpMenuStore";
import { useTabStore } from "$stores/TabStore";
import { Help } from "@mui/icons-material";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

export function HelpBoxAction(): HelpMenuAction {
    const setActiveTab = useTabStore(useShallow((store) => store.setActiveTab));
    const [showHelpBox, setShowHelpBox] = useHelpMenuStore(
        useShallow((store) => [store.showHelpBox, store.setShowHelpBox]),
    );
    const [displaySearch, disableManualSearch] = useCoursePaneStore(
        useShallow((store) => [store.displaySearch, store.disableManualSearch]),
    );

    const handleClick = useCallback(() => {
        setActiveTab("search");
        setShowHelpBox(true);
        displaySearch();
        disableManualSearch();
    }, [disableManualSearch, displaySearch, setActiveTab, setShowHelpBox]);

    return showHelpBox ? null : { icon: <Help />, name: "Show Helpful Info", onClick: handleClick };
}
