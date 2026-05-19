import { Box, TableCell, Tooltip } from '@mui/material';
import { useState } from 'react';

export const STRIP_SLOT_PX = 8;
const STRIP_SHRINK_PX = 5;
const STRIP_EXPAND_PX = 12;

const cellSx = {
    position: 'relative' as const,
    p: 0,
    width: STRIP_SLOT_PX,
    maxWidth: STRIP_SLOT_PX,
    minWidth: STRIP_SLOT_PX,
    verticalAlign: 'stretch' as const,
    overflow: 'visible',
};

interface SectionRowColorStripProps {
    color: string;
    visible: boolean;
    clickable: boolean;
    onOpenPicker: (anchorEl: HTMLElement) => void;
}

export function SectionRowColorStrip({ color, visible, clickable, onOpenPicker }: SectionRowColorStripProps) {
    const [hovered, setHovered] = useState(false);
    const stripWidth = visible && clickable && hovered ? STRIP_EXPAND_PX : STRIP_SHRINK_PX;

    if (!visible) {
        return <TableCell sx={cellSx} />;
    }

    if (!clickable) {
        return (
            <TableCell sx={cellSx}>
                <Box
                    aria-hidden
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: STRIP_SHRINK_PX,
                        bgcolor: color,
                    }}
                />
            </TableCell>
        );
    }

    return (
        <TableCell sx={cellSx}>
            <Tooltip title="Change Color" placement="bottom" arrow open={hovered}>
                <Box
                    component="button"
                    type="button"
                    aria-label="Change section color"
                    onClick={(e) => {
                        e.stopPropagation();
                        const el = e.currentTarget;
                        onOpenPicker(el);
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
                        bgcolor: color,
                        border: 'none',
                        p: 0,
                        cursor: 'pointer',
                        display: 'block',
                    }}
                />
            </Tooltip>
        </TableCell>
    );
}
