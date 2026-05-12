import { SortableItemContext } from '$components/Calendar/Toolbar/ScheduleSelect/drag-and-drop/SortableItem';
import { useThemeStore } from '$stores/SettingsStore';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box } from '@mui/material';
import { useContext } from 'react';

interface DragHandleProps {
    disabled?: boolean;
}

export function DragHandle({ disabled = false }: DragHandleProps) {
    const { attributes, listeners, ref } = useContext(SortableItemContext);
    const isDark = useThemeStore((store) => store.isDark);

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
                    backgroundColor: disabled ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
                },
                '&:focus-visible': {
                    boxShadow: disabled ? 'none' : '0 0 0 2px #4c9ffe',
                },
            }}
        >
            <DragIndicatorIcon
                sx={{
                    color: disabled ? 'gray' : !isDark ? 'black' : 'white',
                }}
            />
        </Box>
    );
}
