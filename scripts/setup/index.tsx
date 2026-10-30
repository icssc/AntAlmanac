import { ThemeProvider } from '@inkjs/ui';
import { render } from 'ink';

import { App } from './components/App';
import { CHECK_STEPS, SETUP_STEPS } from './steps';
import { theme } from './theme';

// tsx passes its --tsconfig to child processes, which breaks commands like `pnpm get-data` that need their own.
delete process.env.TSX_TSCONFIG_PATH;

const isCheck = process.argv.includes('--check');

console.clear();

const { waitUntilExit } = render(
    <ThemeProvider theme={theme}>
        {isCheck ? (
            <App title="A quick health check for your workspace." steps={CHECK_STEPS} />
        ) : (
            <App title="Let’s get the monorepo ready to build." steps={SETUP_STEPS} />
        )}
    </ThemeProvider>
);

await waitUntilExit().catch(() => {
    process.exitCode = 1;
});
