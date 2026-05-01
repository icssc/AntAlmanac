import { SortableItemContext } from '$components/drag-and-drop/SortableItem';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box } from '@mui/material';
import { SxProps, Theme, useTheme } from '@mui/material/styles';
import { mergeSx } from '@mui/x-date-pickers/internals';
import { useContext } from 'react';

interface DragHandleProps {
    disabled?: boolean;
    iconSx?: SxProps<Theme>;
}

export function DragHandle({ disabled = false, iconSx }: DragHandleProps) {
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
                cursor: disabled ? 'auto' : 'grab',
                borderRadius: 1,
                touchAction: 'none',
                '&:hover': {
                    backgroundColor: disabled ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
                },
                '&:focus-visible': {
                    boxShadow: disabled ? 'none' : '0 0 0 2px #4c9ffe',
                },
            }}
        >
            <DragIndicatorIcon
                sx={mergeSx(
                    {
                        color: disabled ? 'gray' : theme.palette.mode === 'light' ? 'black' : 'white',
                    },
                    iconSx
                )}
            />
        </Box>
    );
}
