import { defaultTheme, extendTheme } from '@inkjs/ui';

/**
 * Swaps the default blue for cyan, which stays readable on both light and dark terminal themes.
 */
export const theme = extendTheme(defaultTheme, {
    components: {
        Spinner: {
            styles: {
                frame: () => ({ color: 'cyan' }),
            },
        },
        Select: {
            styles: {
                focusIndicator: () => ({ color: 'cyan' }),
                label: ({ isFocused }: { isFocused: boolean }) => ({ color: isFocused ? 'cyan' : undefined }),
            },
        },
    },
});
