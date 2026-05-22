import { changeCourseColor } from '$actions/AppStoreActions';
import { useIsMobile } from '$hooks/useIsMobile';
import AppStore from '$stores/AppStore';
import { colorPickerPresetColors } from '$stores/scheduleHelpers';
import { Box, Popover, PopoverProps, SxProps, TableCell, Tooltip } from '@mui/material';
import { AASection, AATerm } from '@packages/antalmanac-types';
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

const getSectionScheduleColor = (section: AASection, term: AATerm): string =>
    AppStore.schedule.getExistingCourseInSchedule(section.sectionCode, term)?.section.color ??
    section.color ??
    '#5ec8e0';

interface SectionTableBodyRowColorStripProps {
    section: AASection;
    term: AATerm;
    visible: boolean;
}

export const SectionTableBodyRowColorStrip = memo(({ section, term, visible }: SectionTableBodyRowColorStripProps) => {
    const isMobile = useIsMobile();
    const clickable = !isMobile && visible;

    const [hovered, setHovered] = useState(false);
    const [currColor, setCurrColor] = useState(() => getSectionScheduleColor(section, term));
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
            changeCourseColor(section.sectionCode, term, newColor.hex);
        },
        [section.sectionCode, term]
    );

    useEffect(() => {
        const syncColor = () => {
            setCurrColor(getSectionScheduleColor(section, term));
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
    }, [section.sectionCode, section.color, term]);

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
