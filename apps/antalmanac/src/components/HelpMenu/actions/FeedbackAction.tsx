import { HelpMenuAction } from "$components/HelpMenu/HelpMenu";
import { FEEDBACK_LINK } from "$src/globals";
import { Feedback as FeedbackIcon } from "@mui/icons-material";
import { useCallback } from "react";

export function FeedbackAction(): HelpMenuAction {
    // Hack to simulate a click with an anchor tag
    const handleClick = useCallback(() => {
        const anchor = document.createElement("a");
        anchor.href = FEEDBACK_LINK;
        anchor.target = "_blank";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }, []);

    return { icon: <FeedbackIcon />, name: "Share Feedback", onClick: handleClick };
}
