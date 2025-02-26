import { useMemo } from 'react';

import { BLUE, DODGER_BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';

export function usePrimaryColor() {
    const isDark = useThemeStore((store) => store.isDark);
    const color = useMemo(() => (isDark ? DODGER_BLUE : BLUE), [isDark]);

    return color;
}
