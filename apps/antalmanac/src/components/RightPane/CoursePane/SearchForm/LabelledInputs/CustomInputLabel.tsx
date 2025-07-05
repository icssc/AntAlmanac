import { InputLabel } from '@mui/material';
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
        <InputLabel
            htmlFor={id}
            shrink={false}
            sx={{
                display: 'flex',
                alignItems: 'center',
                height: '34.25px',
                px: 1.5,
                minWidth: isAligned ? '10.35rem' : '6rem',
                bgcolor: isDark ? grey[800] : grey[200],
                whiteSpace: 'nowrap',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                borderRight: 0,
                userSelect: 'none',
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
                color: isDark ? 'white' : 'text.secondary',
            }}
        >
            {label}
        </InputLabel>
    );
};
