import { SortableItemContext } from '$components/drag-and-drop/SortableItem';
import { DraggingItemContext } from '$components/drag-and-drop/SortableList';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box, SxProps, Theme, useTheme } from '@mui/material';
import { mergeSx } from '@mui/x-date-pickers/internals';
import { useContext } from 'react';

interface DragHandleProps {
    disabled?: boolean;
    sx?: SxProps;
    iconSx?: SxProps<Theme>;
}

export function DragHandle({ disabled = false, sx, iconSx }: DragHandleProps) {
    const { attributes, listeners, ref } = useContext(SortableItemContext);
    const draggingState = useContext(DraggingItemContext);

    const theme = useTheme();

    return (
        <Box
            {...attributes}
            {...(disabled ? {} : listeners)}
            ref={ref}
            sx={mergeSx(
                {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: draggingState !== null ? 'grabbing' : disabled ? 'auto' : 'grab',
                    borderRadius: 1,
                    touchAction: 'none',
                    '&:hover': {
                        backgroundColor: disabled ? 'transparent' : theme.palette.action.hover,
                    },
                    '&:focus-visible': {
                        boxShadow: disabled ? 'none' : '0 0 0 2px #4c9ffe',
                    },
                },
                sx
            )}
        >
            <DragIndicatorIcon
                sx={mergeSx(
                    {
                        color: disabled ? theme.palette.action.disabled : theme.palette.action.active,
                    },
                    iconSx
                )}
            />
        </Box>
    );
}
