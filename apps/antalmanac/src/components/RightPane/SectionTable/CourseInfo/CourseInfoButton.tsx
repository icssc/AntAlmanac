import { Button, Paper, Popper } from '@material-ui/core';
import { useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

import { logAnalytics } from '$lib/analytics';
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';

interface CourseInfoButtonProps {
    text: string;
    icon: React.ReactElement;
    redirectLink?: string;
    popupContent?: React.ReactElement;
    analyticsAction: string;
    analyticsCategory: string;
}

export const CourseInfoButton = ({
    text,
    icon,
    redirectLink,
    popupContent,
    analyticsAction,
    analyticsCategory,
}: CourseInfoButtonProps) => {
    const theme = useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [popupAnchor, setPopupAnchor] = useState<HTMLElement | null>(null);
    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        // When the user clicks on the button, it triggers both onMouseEnter
        // and onClick. In order to log the analytics only once, we should
        // have this hook when the popupAnchor changes
        if (popupAnchor) {
            logAnalytics({
                category: analyticsCategory,
                action: analyticsAction,
            });
        }
    }, [popupAnchor, analyticsCategory, analyticsAction]);

    const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
        // If there is popup content, allow the content to be shown when the button is hovered
        // Note that on mobile devices, hovering is not possible, so the popup still needs to be able
        // to appear when the button is clicked
        if (popupContent) {
            setPopupAnchor(event.currentTarget);
        }
    };

    const handleMouseLeave = () => {
        if (popupContent) {
            setIsClicked(false);
            setPopupAnchor(null);
        }
    };

    const scheduleManagementWidth = useScheduleManagementStore((state) => state.scheduleManagementWidth);
    const compact =
        isMobileScreen || (scheduleManagementWidth && scheduleManagementWidth < theme.breakpoints.values.xs);

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ display: 'flex' }}>
            <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                    if (redirectLink) {
                        window.open(redirectLink);
                    }

                    if (popupContent) {
                        // This is mostly used for devices that don't support hovering
                        // and thus only support clicking to open/close the popup
                        // If isClicked is true, then the popup is currently visible; otherwise, if
                        // isClicked is false, then the popup is currently hidden
                        setPopupAnchor(isClicked ? null : event.currentTarget);
                        setIsClicked((prev) => !prev);
                    }
                }}
            >
                <span style={{ display: 'flex', gap: 4 }}>
                    {icon}
                    {!compact && (
                        <span
                            style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {text}
                        </span>
                    )}
                </span>
            </Button>

            {popupContent && (
                <Popper anchorEl={popupAnchor} open={Boolean(popupAnchor)} placement="bottom">
                    <Paper>{popupContent}</Paper>
                </Popper>
            )}
        </div>
    );
};
