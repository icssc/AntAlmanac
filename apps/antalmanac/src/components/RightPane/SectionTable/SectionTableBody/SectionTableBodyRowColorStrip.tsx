import { changeCourseColor } from '$actions/AppStoreActions';
import { useIsMobile } from '$hooks/useIsMobile';
import { useSectionDisplayColor } from '$hooks/useSectionDisplayColor';
import { courseColorKey } from '$lib/sectionThemes';
import { colorPickerPresetColors } from '$stores/scheduleHelpers';
import { useSectionThemeStore } from '$stores/SectionThemeStore';
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

interface SectionTableBodyRowColorStripProps {
    section: AASection;
    term: AATerm;
    visible: boolean;
}

export const SectionTableBodyRowColorStrip = memo(({ section, term, visible }: SectionTableBodyRowColorStripProps) => {
    const isMobile = useIsMobile();
    const clickable = !isMobile && visible;

    const sectionColor = useSectionThemeStore((s) => s.sectionColor);
    const setManualColor = useSectionThemeStore((s) => s.setManualColor);

    const [hovered, setHovered] = useState(false);
    const [draftColor, setDraftColor] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<PopoverProps['anchorEl']>(null);

    const displayColor = useSectionDisplayColor({
        term,
        sectionCode: section.sectionCode,
        fallbackColor: section.color ?? '#5ec8e0',
    });

    const swatchColor = draftColor ?? displayColor;
    const stripWidth = visible && clickable && hovered ? STRIP_EXPAND_PX : STRIP_SHRINK_PX;

    useEffect(() => {
        if (!anchorEl) {
            setDraftColor(null);
        }
    }, [anchorEl]);

    const handleOpenPicker = useCallback((anchorEl: HTMLElement) => {
        setAnchorEl((prev) => (prev === anchorEl ? null : anchorEl));
    }, []);

    const handlePopoverClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleColorChange = useCallback(
        (newColor: { hex: string }) => {
            setDraftColor(newColor.hex);
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
                                bgcolor: swatchColor,
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
                            bgcolor: swatchColor,
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
                        color={swatchColor}
                        onChange={handleColorChange}
                        presetColors={colorPickerPresetColors}
                    />
                </Popover>
            )}
        </>
    );
});

SectionTableBodyRowColorStrip.displayName = 'SectionTableBodyRowColorStrip';
