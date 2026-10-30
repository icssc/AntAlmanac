import { render } from 'ink';

import { App } from './components/App';
import { CHECK_STEPS, SETUP_STEPS } from './steps';

// tsx passes its --tsconfig to child processes, which breaks commands like `pnpm get-data` that need their own.
delete process.env.TSX_TSCONFIG_PATH;

const steps = process.argv.includes('--check') ? CHECK_STEPS : SETUP_STEPS;

const { waitUntilExit } = render(<App steps={steps} />);

await waitUntilExit().catch(() => {
    process.exitCode = 1;
});
