import { Box, InputAdornment } from '@mui/material';
import { grey } from '@mui/material/colors';

interface ManualSearchInputAdornmentProps {
    label: string;
}

export const ManualSearchInputAdornment = ({ label }: ManualSearchInputAdornmentProps) => {
    return (
        <InputAdornment position="start">
            <Box
                sx={{
                    py: 1,
                    px: 1.5,
                    gap: 0,
                    bgcolor: grey[200],
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {label}
            </Box>
        </InputAdornment>
    );
};
