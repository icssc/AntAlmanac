import { fileURLToPath } from 'node:url';

import { App } from '$src/App';
import { STEPS } from '$src/steps';
import { theme } from '$src/theme';
import { ThemeProvider } from '@inkjs/ui';
import { render } from 'ink';

// Steps use paths relative to the repository root, but pnpm starts this package in its own folder.
process.chdir(fileURLToPath(new URL('../..', import.meta.url)));

console.clear();

const { waitUntilExit } = render(
    <ThemeProvider theme={theme}>
        <App steps={STEPS} />
    </ThemeProvider>
);

await waitUntilExit().catch(() => {
    process.exitCode = 1;
});
