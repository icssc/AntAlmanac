import { SortableItemContext } from '$components/Calendar/Toolbar/ScheduleSelect/drag-and-drop/SortableItem';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box, useTheme } from '@mui/material';
import { useContext } from 'react';

interface DragHandleProps {
    disabled?: boolean;
}

export function DragHandle({ disabled = false }: DragHandleProps) {
    const { attributes, listeners, ref } = useContext(SortableItemContext);
    const theme = useTheme();

    return (
        <Box
            {...attributes}
            {...(disabled ? {} : listeners)}
            ref={ref}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'auto' : 'pointer',
                borderRadius: 1,
                '&:hover': {
                    backgroundColor: disabled ? 'transparent' : theme.palette.action.hover,
                },
                '&:focus-visible': {
                    boxShadow: disabled ? 'none' : '0 0 0 2px #4c9ffe',
                },
            }}
        >
            <DragIndicatorIcon
                sx={{
                    color: disabled ? theme.palette.action.disabled : theme.palette.action.active,
                }}
            />
        </Box>
    );
}
