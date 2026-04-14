import { useMemo } from 'react';

import { BLUE, LIGHT_BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';

export function useSecondaryColor() {
    const isDark = useThemeStore((store) => store.isDark);
    const color = useMemo(() => (isDark ? LIGHT_BLUE : BLUE), [isDark]);

    return color;
}
