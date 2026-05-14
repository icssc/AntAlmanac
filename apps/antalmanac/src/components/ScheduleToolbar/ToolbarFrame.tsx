import { Box, Paper, type SxProps } from '@mui/material';
import type { ReactNode } from 'react';

interface ToolbarFrameProps {
    children: ReactNode;
    sx?: SxProps;
}

export function ToolbarFrame({ children, sx }: ToolbarFrameProps) {
    return (
        <Paper
            elevation={0}
            square
            variant="outlined"
            sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                padding: 1,
                borderRadius: '4px 4px 0 0',
                containerType: 'inline-size',
                containerName: 'toolbar',
                borderWidth: '1px 0px 1px 0px',
                ...((sx ?? {}) as object),
            }}
        >
            <Box display="flex" alignItems="center" gap={1} width="100%">
                {children}
            </Box>
        </Paper>
    );
}
