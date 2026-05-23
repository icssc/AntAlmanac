import { changeCourseColor } from '$actions/AppStoreActions';
import { useIsMobile } from '$hooks/useIsMobile';
import { resolveCourseColors } from '$lib/sectionThemes';
import { bakeThemeIntoSchedule } from '$lib/sectionThemes/bakeTheme';
import AppStore from '$stores/AppStore';
import { colorPickerPresetColors } from '$stores/scheduleHelpers';
import { selectActiveSectionColor, useSectionThemeStore } from '$stores/SectionThemeStore';
import { useThemeStore } from '$stores/SettingsStore';
import { Box, Popover, PopoverProps, SxProps, TableCell, Tooltip } from '@mui/material';
import { AASection, AATerm } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { memo, useCallback, useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';

const STRIP_SHRINK_PX = 5;
const STRIP_EXPAND_PX = 8;

const cellSx: SxProps = {
    position: 'relative',
    padding: 0,
    width: STRIP_SHRINK_PX,
    verticalAlign: 'stretch',
    overflow: 'visible',
};

function getDisplayColor(section: AASection, term: AATerm, theme: string, isDark: boolean): string {
    const courses = AppStore.schedule.getCurrentCourses();
    const index = courses.findIndex((c) => c.section.sectionCode === section.sectionCode && c.term === term);
    if (index === -1) {
        return section.color ?? '#5ec8e0';
    }
    if (theme === 'custom') {
        return courses[index].section.color;
    }
    const themed = resolveCourseColors(courses, theme as never, isDark);
    return themed[index];
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
    const setSectionColor = useSectionThemeStore((s) => s.setSectionColor);
    const isDark = useThemeStore((s) => s.isDark);
    const postHog = usePostHog();

    const [hovered, setHovered] = useState(false);
    const [currColor, setCurrColor] = useState(() => getDisplayColor(section, term, activeSectionColor, isDark));
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
            if (sectionColor !== 'custom') {
                bakeThemeIntoSchedule(sectionColor, isDark);
                setSectionColor('custom', postHog);
            }
            setCurrColor(newColor.hex);
            changeCourseColor(section.sectionCode, term, newColor.hex);
        },
        [section.sectionCode, term, sectionColor, isDark, setSectionColor, postHog]
    );

    useEffect(() => {
        const syncColor = () => {
            setCurrColor(getDisplayColor(section, term, activeSectionColor, isDark));
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
    }, [section, term, activeSectionColor, isDark]);

    useEffect(() => {
        if (!visible) {
            return;
        }
        AppStore.registerColorPicker(section.sectionCode, updateColorFromPicker);
        return () => {
            AppStore.unregisterColorPicker(section.sectionCode, updateColorFromPicker);
        };
    }, [visible, section.sectionCode, updateColorFromPicker]);

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
                    <SketchPicker
                        color={currColor}
                        onChange={handleColorChange}
                        presetColors={colorPickerPresetColors}
                    />
                </Popover>
            )}
        </>
    );
});

SectionTableBodyRowColorStrip.displayName = 'SectionTableBodyRowColorStrip';
