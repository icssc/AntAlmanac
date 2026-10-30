import { spawn } from 'node:child_process';
import { parseArgs } from 'node:util';

import { render } from 'ink';

import { root } from './env';
import { resetSteps, runSteps } from './steps';
import { App, getState, select, update } from './ui';

const { values: args } = (() => {
    try {
        return parseArgs({
            options: { yes: { type: 'boolean' }, check: { type: 'boolean' }, help: { type: 'boolean', short: 'h' } },
        });
    } catch (error) {
        console.error(`${(error as Error).message}. Run with --help to see the options.`);
        process.exit(1);
    }
})();

if (args.help) {
    console.log(`AntAlmanac developer setup

  mise run setup                Guided setup
  mise run doctor               Read-only check of your environment
  pnpm run setup --yes          Set up without prompts
  pnpm run setup --check        Read-only check without prompts

Setup creates your .env files, starts the local Postgres in Docker,
applies migrations, and downloads course data. It is safe to rerun.`);
    process.exit(0);
}

const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY) && !args.yes && !args.check;
if (!interactive && !args.yes && !args.check) {
    console.error('No interactive terminal. Use --yes to set up without prompts, or --check for a read-only check.');
    process.exit(1);
}
const rerun = process.env.ANTALMANAC_TOOLCHAIN === 'mise' ? 'mise run setup' : 'pnpm run setup';

let finished = false;
const app = render(<App />);
void app.waitUntilExit().then(() => {
    if (finished) return;
    console.log(`Setup stopped. Run ${rerun} to continue; finished steps are safe to rerun.`);
    process.exit(130);
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => finished || app.unmount());

type Action = 'setup' | 'check' | 'retry' | 'dev' | 'exit';
let action: Action = args.check ? 'check' : 'setup';
let check = false;
let ready = true;

update({ title: 'Make yourself at home.' });
if (interactive) {
    action = await select('What would you like to do?', {
        setup: 'Set up my workspace',
        check: 'Check my environment (changes nothing)',
        exit: 'Exit',
    });
}

while (action !== 'exit' && action !== 'dev') {
    if (action !== 'retry') {
        check = action === 'check';
        resetSteps(check);
    }
    update({ title: check ? 'Checking your environment…' : 'Setting up your workspace…', note: undefined });
    ready = await runSteps({ check, interactive });
    const failed = getState().steps.filter(({ status }) => status === 'failed').length;
    update({
        title: ready
            ? check
                ? 'Everything looks good.'
                : 'Your workspace is ready.'
            : `${failed} ${failed === 1 ? 'step needs' : 'steps need'} a fix.`,
        showCommands: ready && !check,
    });
    if (!interactive) break;
    if (ready && !check) action = await select('What next?', { dev: 'Start the development server', exit: 'Exit' });
    else if (check)
        action = await select('What next?', { retry: 'Check again', setup: 'Set up my workspace', exit: 'Exit' });
    else action = await select('What next?', { retry: 'Retry', exit: 'Exit' });
}

if (!ready) update({ note: `Fix the steps above, then run ${rerun} again.` });
finished = true;
await app.waitUntilRenderFlush();
app.unmount();
await app.waitUntilExit();
process.exitCode = ready ? 0 : 1;

if (action === 'dev') {
    spawn('pnpm', ['dev'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' }).on('close', (code) => {
        process.exitCode = code ?? 0;
    });
}
