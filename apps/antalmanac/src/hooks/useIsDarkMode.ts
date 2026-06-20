import { useColorScheme } from '@mui/material/styles';

export function getIsDarkMode(): boolean {
    if (typeof document === 'undefined') {
        return false;
    }

    return document.documentElement.classList.contains('dark');
}

export function useIsDarkMode(): boolean {
    const { mode, systemMode, colorScheme } = useColorScheme();

    if (colorScheme === 'dark') {
        return true;
    }
    if (colorScheme === 'light') {
        return false;
    }

    if (mode === 'dark') {
        return true;
    }
    if (mode === 'light') {
        return false;
    }
    if (mode === 'system' && systemMode) {
        return systemMode === 'dark';
    }

    return getIsDarkMode();
}
