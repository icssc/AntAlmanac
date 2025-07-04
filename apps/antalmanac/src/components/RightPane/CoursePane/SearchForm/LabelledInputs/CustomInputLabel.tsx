import { Box } from '@mui/material';
import { grey } from '@mui/material/colors';

import { useThemeStore } from '$stores/SettingsStore';

interface CustomInputLabelProps {
    label: string;
    id: string;
    isAligned?: boolean;
}

export const CustomInputLabel = ({ label, id, isAligned }: CustomInputLabelProps) => {
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <Box
            id={`input-label-${id}`}
            display={'flex'}
            alignItems={'center'}
            boxSizing={'border-box'}
            height={'34.25px'}
            paddingX={1.5}
            minWidth={isAligned ? '10.25rem' : '6rem'}
            bgcolor={isDark ? grey[800] : grey[200]}
            whiteSpace={'nowrap'}
            border={'1px solid'}
            borderColor={isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}
            borderRight={0}
            sx={{
                userSelect: 'none',
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
            }}
        >
            {label}
        </Box>
    );
};
