import { changeCourseColor, changeCustomEventColor } from '$actions/AppStoreActions';
import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { type AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';
import { customEventColorKey, getPalette, resolveAssignment } from '$lib/sectionThemes';
import AppStore from '$stores/AppStore';
import { colorPickerPresetColors, scheduleSectionKey } from '$stores/scheduleHelpers';
import { selectActiveSectionColor, useSectionThemeStore } from '$stores/SectionThemeStore';
import { ColorLens } from '@mui/icons-material';
import { IconButton, Popover, type PopoverProps, Tooltip } from '@mui/material';
import { type CustomEventId, type AATerm } from '@packages/antalmanac-types';
import Sketch from '@uiw/react-color-sketch';
import { PostHog, usePostHog } from 'posthog-js/react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

interface ColorPickerProps {
    color: string;
    analyticsCategory: AnalyticsCategory;
    /**If true, this object has a customEventID. If false, this object has a term and sectionCode. */
    isCustomEvent: boolean;
    /**Not undefined when isCustomEvent is true */
    customEventID?: CustomEventId;
    /**Not undefined  when isCustomEvent is false */
    term?: AATerm;
    /**Not undefined  when isCustomEvent is false */
    sectionCode?: string;
}

export const ColorPicker = memo(function ColorPicker({
    color,
    analyticsCategory,
    isCustomEvent,
    customEventID,
    term,
    sectionCode,
}: ColorPickerProps) {
    const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>(null);
    const [currColor, setCurrColor] = useState(color);

    const sectionColor = useSectionThemeStore((s) => s.sectionColor);
    const activeSectionColor = useSectionThemeStore(selectActiveSectionColor);
    const activeAssignments = useSectionThemeStore((s) => s.activeAssignments);
    const setManualColor = useSectionThemeStore((s) => s.setManualColor);
    const isDark = useIsDarkMode();

    const postHog = usePostHog();

    // When a preset theme is active (including while previewing one on hover), show the theme's
    // resolved color for this section/custom event instead of the stored color, so the swatch and
    // picker track the theme. Falls back to the live/stored color on the custom setting.
    const themedColor = useMemo(() => {
        if (activeSectionColor === 'custom') return null;
        const key =
            isCustomEvent && customEventID != null
                ? customEventColorKey(customEventID)
                : sectionCode != null && term != null
                  ? scheduleSectionKey(term, sectionCode)
                  : null;
        const value = key != null ? activeAssignments[key] : undefined;
        return value != null ? resolveAssignment(value, getPalette(activeSectionColor, isDark)) : null;
    }, [activeSectionColor, activeAssignments, isDark, isCustomEvent, customEventID, sectionCode, term]);

    const displayColor = themedColor ?? currColor;

    // Reflect color changes that come from the parent (e.g. theme switch repaints).
    useEffect(() => {
        setCurrColor(color);
    }, [color]);

    const updateColor = useCallback((newColor: string) => {
        setCurrColor((prev) => (prev === newColor ? prev : newColor));
    }, []);

    useEffect(() => {
        let colorPickerId;
        if (isCustomEvent && customEventID) colorPickerId = customEventID.toString();
        else if (sectionCode && term) colorPickerId = scheduleSectionKey(term, sectionCode);
        else throw new Error("Colorpicker custom component wasn't supplied a custom event id or a section code.");
        AppStore.registerColorPicker(colorPickerId, updateColor);

        return () => {
            AppStore.unregisterColorPicker(colorPickerId, updateColor);
        };
    }, [isCustomEvent, customEventID, sectionCode, term, updateColor]);

    const openPicker = (target: HTMLElement, postHog?: PostHog) => {
        setAnchorEl(target);
        logAnalytics(postHog, {
            category: analyticsCategory,
            action: analyticsCategory.actions.CHANGE_COURSE_COLOR,
        });
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, postHog?: PostHog) => {
        event.stopPropagation();
        openPicker(event.currentTarget, postHog);
    };

    const handleClose = (event: Event) => {
        if (event.stopPropagation) event.stopPropagation();
        setAnchorEl(null);
    };

    const handleColorChange = (newColor: { hex: string }) => {
        setCurrColor(newColor.hex);

        // On a preset theme, store the change as a per-section override layered on the
        // theme (keeps the theme selected and leaves the user's custom palette untouched).
        if (sectionColor !== 'custom') {
            const key =
                isCustomEvent && customEventID
                    ? customEventColorKey(customEventID)
                    : sectionCode != null && term != null
                      ? scheduleSectionKey(term, sectionCode)
                      : null;
            if (key != null) setManualColor(sectionColor, key, newColor.hex);
            return;
        }

        // On custom, edit the course/event's stored color directly.
        if (isCustomEvent && customEventID) changeCustomEventColor(customEventID, newColor.hex);
        else if (sectionCode && term) changeCourseColor(sectionCode, term, newColor.hex);
    };

    return (
        <>
            <Tooltip title="Change Color">
                <IconButton
                    sx={{ color: displayColor, padding: 0.5 }}
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
                <Sketch color={displayColor} onChange={handleColorChange} presetColors={colorPickerPresetColors} />
            </Popover>
        </>
    );
});
