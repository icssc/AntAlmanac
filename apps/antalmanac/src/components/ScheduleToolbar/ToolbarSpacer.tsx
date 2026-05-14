import { Box, type SxProps } from '@mui/material';

interface ToolbarSpacerProps {
    sx?: SxProps;
}

export function ToolbarSpacer({ sx }: ToolbarSpacerProps) {
    return <Box sx={{ flexGrow: 1, ...((sx ?? {}) as object) }} />;
}
