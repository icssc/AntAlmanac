import { useColorScheme } from '@mui/material/styles';

export function useIsDarkMode(): boolean {
    const { mode, systemMode } = useColorScheme();
    if (mode === 'system') return systemMode === 'dark';
    return mode === 'dark';
}
