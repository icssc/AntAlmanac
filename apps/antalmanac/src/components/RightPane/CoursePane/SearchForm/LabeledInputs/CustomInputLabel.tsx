import { InputLabel } from '@mui/material';
import { grey } from '@mui/material/colors';

import { useThemeStore } from '$stores/SettingsStore';

interface CustomInputLabelProps {
    label: React.ReactNode;
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
                height: '100%',
                px: 1.5,
                minWidth: isAligned ? '10.5rem' : '7rem',
                bgcolor: isDark ? grey[800] : grey[200],
                whiteSpace: 'nowrap',
                border: '1px solid',
                // Adjusted borderColor to better match the background of CustomInputBox.
                // The default theme.palette.divider values are:
                // - Light mode: rgba(0, 0, 0, 0.12)
                // - Dark mode: rgba(255, 255, 255, 0.12)
                //
                // These low-opacity borders tend to visually blend with the component’s background.
                // However, because CustomInputLabel has a darker background than CustomInputBox,
                // using the default divider color results in a visible mismatch.
                //
                // To address this, we slightly increase the opacity for both modes
                // to achieve better visual consistency between label and input box.
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1525)' : 'rgba(0, 0, 0, 0.19)',
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
