import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

const fieldRowSx: SxProps<Theme> = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    width: '100%',
};

interface AdvancedSearchFieldRowProps {
    children: ReactNode;
}

export function AdvancedSearchFieldRow({ children }: AdvancedSearchFieldRowProps) {
    return <Box sx={fieldRowSx}>{children}</Box>;
}
