import { changeCourseColor } from '$actions/AppStoreActions';
import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { useIsMobile } from '$hooks/useIsMobile';
import {
    courseColorKey,
    getPalette,
    resolveAssignment,
    type SectionColorSetting,
    type ThemeAssignmentMap,
} from '$lib/sectionThemes';
import AppStore from '$stores/AppStore';
import { colorPickerPresetColors } from '$stores/scheduleHelpers';
import { selectActiveSectionColor, useSectionThemeStore } from '$stores/SectionThemeStore';
import { Box, Popover, type PopoverProps, type SxProps, TableCell, Tooltip } from '@mui/material';
import { type AASection, type AATerm } from '@packages/antalmanac-types';
import Sketch from '@uiw/react-color-sketch';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

const STRIP_SHRINK_PX = 5;
const STRIP_EXPAND_PX = 8;

/** Stable empty map so the color-sync effect doesn't re-run (and re-subscribe) every render. */
const EMPTY_ASSIGNMENTS: ThemeAssignmentMap = {};

const cellSx: SxProps = {
    position: 'relative',
    padding: 0,
    width: STRIP_SHRINK_PX,
    verticalAlign: 'stretch',
    overflow: 'visible',
};

function getDisplayColor(
    section: AASection,
    term: AATerm,
    setting: SectionColorSetting,
    assignments: ThemeAssignmentMap,
    palette: readonly (readonly string[])[]
): string {
    const scheduledSection = AppStore.schedule.findSectionInSchedule(section.sectionCode, term);
    if (!scheduledSection) {
        return section.color ?? '#5ec8e0';
    }
    if (setting === 'custom') {
        return scheduledSection.color;
    }
    const value = assignments[courseColorKey(term, section.sectionCode)];
    return value != null ? resolveAssignment(value, palette) : scheduledSection.color;
}

interface SectionTableBodyRowColorStripProps {
    section: AASection;
    term: AATerm;
    visible: boolean;
}

export const SectionTableBodyRowColorStrip = memo(({ section, term, visible }: SectionTableBodyRowColorStripProps) => {
    const isMobile = useIsMobile();
    const clickable = !isMobile && visible;

    const sectionColor = useSectionThemeStore((s) => s.sectionColor);
    const activeSectionColor = useSectionThemeStore(selectActiveSectionColor);
    const setManualColor = useSectionThemeStore((s) => s.setManualColor);
    // Read the single resolved source of truth so the strip always matches the calendar
    // (which reads the same map via useSectionThemeAssignments).
    const activeAssignments = useSectionThemeStore((s) => s.activeAssignments);
    const isDark = useIsDarkMode();

    const palette = useMemo(() => getPalette(activeSectionColor, isDark), [activeSectionColor, isDark]);
    const assignments = activeSectionColor === 'custom' ? EMPTY_ASSIGNMENTS : activeAssignments;

    const [hovered, setHovered] = useState(false);
    const [currColor, setCurrColor] = useState(() =>
        getDisplayColor(section, term, activeSectionColor, assignments, palette)
    );
    const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>(null);

    const stripWidth = visible && clickable && hovered ? STRIP_EXPAND_PX : STRIP_SHRINK_PX;

    const updateColorFromPicker = useCallback((newColor: string) => {
        setCurrColor(newColor);
    }, []);

    const handleOpenPicker = useCallback((anchorEl: HTMLElement) => {
        setAnchorEl((prev) => (prev === anchorEl ? null : anchorEl));
    }, []);

    const handlePopoverClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleColorChange = useCallback(
        (newColor: { hex: string }) => {
            setCurrColor(newColor.hex);
            // On a preset theme, store an override layered on the theme; on custom, edit
            // the section's stored color directly.
            if (sectionColor !== 'custom') {
                setManualColor(sectionColor, courseColorKey(term, section.sectionCode), newColor.hex);
            } else {
                changeCourseColor(section.sectionCode, term, newColor.hex);
            }
        },
        [section.sectionCode, term, sectionColor, setManualColor]
    );

    useEffect(() => {
        const syncColor = () => {
            setCurrColor(getDisplayColor(section, term, activeSectionColor, assignments, palette));
        };

        syncColor();

        AppStore.on('addedCoursesChange', syncColor);
        AppStore.on('currentScheduleIndexChange', syncColor);
        AppStore.on('colorChange', syncColor);

        return () => {
            AppStore.removeListener('addedCoursesChange', syncColor);
            AppStore.removeListener('currentScheduleIndexChange', syncColor);
            AppStore.removeListener('colorChange', syncColor);
        };
    }, [section, term]);

    useEffect(() => {
        if (!visible) {
            return;
        }
        const pickerId = courseColorKey(term, section.sectionCode);
        AppStore.registerColorPicker(pickerId, updateColorFromPicker);
        return () => {
            AppStore.unregisterColorPicker(pickerId, updateColorFromPicker);
        };
    }, [visible, section.sectionCode, term, updateColorFromPicker]);

    if (!visible) {
        return <TableCell sx={cellSx} />;
    }

    return (
        <>
            <TableCell sx={cellSx}>
                {clickable ? (
                    <Tooltip title="Change Color" placement="bottom" open={hovered}>
                        <Box
                            component="button"
                            type="button"
                            aria-label="Change section color"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPicker(e.currentTarget);
                            }}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            sx={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: stripWidth,
                                transition: 'width 120ms ease-out',
                                bgcolor: currColor,
                                border: 'none',
                                p: 0,
                                cursor: 'pointer',
                                display: 'block',
                            }}
                        />
                    </Tooltip>
                ) : (
                    <Box
                        aria-hidden
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: STRIP_SHRINK_PX,
                            bgcolor: currColor,
                        }}
                    />
                )}
            </TableCell>
            {clickable && (
                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    onClick={(e) => e.stopPropagation()}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <Sketch color={currColor} onChange={handleColorChange} presetColors={colorPickerPresetColors} />
                </Popover>
            )}
        </>
    );
});

SectionTableBodyRowColorStrip.displayName = 'SectionTableBodyRowColorStrip';
