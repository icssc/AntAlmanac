import { useMemo } from 'react';

import { BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';

export function useSecondaryColor() {
    const isDark = useThemeStore((store) => store.isDark);
    const color = useMemo(() => (isDark ? '#90B3F9' : BLUE), [isDark]);

    return color;
}
