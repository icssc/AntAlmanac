import { ColorLens } from '@mui/icons-material';
import { IconButton, Popover, Tooltip } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';

import { changeCourseColor, changeCustomEventColor } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import AppStore from '$stores/AppStore';

interface ColorPickerProps {
    color: string;
    analyticsCategory: string;
    /**
     * If true, this object has a customEventID. If false, this object has a term and sectionCode.
     */
    isCustomEvent: boolean;
    customEventId?: number;
    term?: string;
    sectionCode?: string;
}

export function ColorPicker({
    color: initialColor,
    analyticsCategory,
    isCustomEvent,
    customEventId,
    term,
    sectionCode,
}: ColorPickerProps) {
    const [anchorEl, setAnchorEl] = useState<Element>();
    const [color, setColor] = useState(initialColor);

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();

        setAnchorEl(e.currentTarget);

        logAnalytics({
            category: analyticsCategory,
            action: analyticsEnum.calendar.actions.CHANGE_COURSE_COLOR,
        });
    }, []);

    const handleClose = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setAnchorEl(undefined);
    }, []);

    const handleChange = useCallback((color: { hex: string }) => {
        setColor(color.hex);

        if (isCustomEvent && customEventId) {
            changeCustomEventColor(customEventId, color.hex);
            return;
        }

        if (sectionCode && term) {
            changeCourseColor(sectionCode, term, color.hex);
            return;
        }
    }, []);

    const updateColor = useCallback((newColor: string) => {
        if (newColor !== color) {
            setColor(newColor);
        }
    }, []);

    useEffect(() => {
        let colorPickerId: string;

        if (isCustomEvent && customEventId !== undefined) {
            colorPickerId = customEventId.toString();
        } else if (sectionCode) {
            colorPickerId = sectionCode;
        } else {
            throw new Error("ColorPicker component wasn't supplied a custom event id or a section code.");
        }

        AppStore.registerColorPicker(colorPickerId, updateColor);

        return () => {
            AppStore.unregisterColorPicker(colorPickerId, updateColor);
        };
    }, [isCustomEvent, customEventId, sectionCode, updateColor]);

    return (
        <>
            <Tooltip title="Change Color">
                <IconButton sx={{ color: color, padding: 1 }} onClick={handleClick}>
                    <ColorLens fontSize="small" />
                </IconButton>
            </Tooltip>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <SketchPicker color={color} onChange={handleChange} />
            </Popover>
        </>
    );
}
