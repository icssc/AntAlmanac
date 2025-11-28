import { ColorLens } from '@mui/icons-material';
import { IconButton, Popover, PopoverProps, Tooltip } from '@mui/material';
import { PostHog, usePostHog } from 'posthog-js/react';
import { memo, useCallback, useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';

import { changeCourseColor, changeCustomEventColor } from '$actions/AppStoreActions';
import { AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { colorPickerPresetColors } from '$stores/scheduleHelpers';

interface ColorPickerProps {
    color: string;
    analyticsCategory: AnalyticsCategory;
    /**If true, this object has a customEventID. If false, this object has a term and sectionCode. */
    isCustomEvent: boolean;
    /**Not undefined when isCustomEvent is true */
    customEventID?: number | string;
    /**Not undefined  when isCustomEvent is false */
    term?: string;
    /**Not undefined  when isCustomEvent is false */
    sectionCode?: string;
}
export const ColorPicker = memo(
    ({ color, analyticsCategory, isCustomEvent, customEventID, term, sectionCode }: ColorPickerProps) => {
        const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>(null);
        const [currColor, setCurrColor] = useState(color);

        const postHog = usePostHog();

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>, postHog?: PostHog) => {
            event.stopPropagation();

            setAnchorEl(event.currentTarget);

            logAnalytics(postHog, {
                category: analyticsCategory,
                action: analyticsCategory.actions.CHANGE_COURSE_COLOR,
            });
        };

        const handleClose = (event: Event) => {
            if (event.stopPropagation) event.stopPropagation();
            setAnchorEl(null);
        };

        const handleColorChange = (newColor: { hex: string }) => {
            setCurrColor(newColor.hex);

            if (isCustomEvent && customEventID) {
                changeCustomEventColor(customEventID, newColor.hex);
            } else if (sectionCode && term) {
                changeCourseColor(sectionCode, term, newColor.hex);
            }
        };

        const updateColor = useCallback(
            (newColor: string) => {
                if (currColor !== newColor) {
                    setCurrColor(newColor);
                }
            },
            [currColor]
        );

        useEffect(() => {
            let colorPickerId;
            if (isCustomEvent && customEventID) colorPickerId = customEventID.toString();
            else if (sectionCode) colorPickerId = sectionCode;
            else throw new Error("Colorpicker custom component wasn't supplied a custom event id or a section code.");
            AppStore.registerColorPicker(colorPickerId, updateColor);

            return () => {
                AppStore.unregisterColorPicker(colorPickerId, updateColor);
            };
        }, [isCustomEvent, customEventID, sectionCode, updateColor]);

        return (
            <>
                <Tooltip title="Change Color">
                    <IconButton
                        style={{ color: currColor, padding: 8 }}
                        onClick={(e) => {
                            handleClick(e, postHog);
                        }}
                    >
                        <ColorLens fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    onClick={(e) => e.stopPropagation()}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <SketchPicker
                        color={currColor}
                        onChange={handleColorChange}
                        presetColors={colorPickerPresetColors}
                    />
                </Popover>
            </>
        );
    }
);

ColorPicker.displayName = 'ColorPicker';
