import { render } from 'ink';

import { App } from './App';
import { CHECK_STEPS, SETUP_STEPS } from './steps';

const steps = process.argv.includes('--check') ? CHECK_STEPS : SETUP_STEPS;

const { waitUntilExit } = render(<App steps={steps} />);

await waitUntilExit().catch(() => {
    process.exitCode = 1;
});
