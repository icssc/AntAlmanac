import assert from 'node:assert/strict';
import test from 'node:test';

import { formatApiKeyInstructions } from './core.mjs';
import { LOGO, LOGO_SMALL } from './logo.mjs';
import { Terminal, openBrowser } from './ui.mjs';

function terminal() {
    const ui = new Terminal({ plain: true });
    ui.steps = ['Tools', 'Dependencies', 'Credentials', 'Database', 'Migrations', 'Course data', 'Ready'].map(
        (label) => ({ label, status: 'pending' })
    );
    return ui;
}

function menu(ui) {
    ui.prompt = {
        title: 'Next step',
        options: ['Retry unfinished steps', 'Inspect results', 'Finish'],
        selected: 0,
        descriptions: ['Fix the reported issues, then retry.'],
    };
}

test('a failed step states the cause on the menu and in the step list', () => {
    const ui = terminal();
    ui.steps[3].id = 'database';
    ui.steps[3].status = 'failed';
    ui.steps[3].summary = 'Postgres is not running.';
    menu(ui);
    for (const [columns, rows] of [
        [40, 16],
        [80, 24],
        [120, 40],
    ]) {
        const screen = ui.screen(columns, rows);
        const text = screen.replaceAll(/\s+/g, ' ');
        assert.match(text, /Fix this before continuing/);
        assert.match(text, /Postgres is not running/);
        assert.match(text, /Retry unfinished steps/);
        assert.match(screen, /Enter/);
        assert.ok(screen.split('\n').length < rows);
        assert.ok(screen.split('\n').every((line) => line.length < columns));
    }
    ui.prompt = null;
    const running = ui.screen(100, 40);
    assert.match(running, /Postgres is not running/);
    assert.match(running, /1 step to fix/);
});

test('menus and keyboard controls remain visible at small terminal sizes', () => {
    const ui = terminal();
    menu(ui);
    for (const [columns, rows] of [
        [40, 16],
        [80, 24],
        [120, 40],
    ]) {
        const screen = ui.screen(columns, rows);
        assert.match(screen, /Retry unfinished steps/);
        assert.match(screen, /Finish/);
        assert.match(screen, /Enter/);
        assert.ok(screen.split('\n').length < rows);
        assert.ok(screen.split('\n').every((line) => line.length < columns));
    }
});

test('a large terminal shows the logo traced from logo.svg without hiding the menu', () => {
    const ui = terminal();
    menu(ui);
    const screen = ui.screen(140, 64);
    assert.ok(screen.includes(LOGO[0].trim()));
    assert.ok(screen.includes(LOGO.at(-1).trim()));
    assert.match(screen, /Retry unfinished steps/);
    assert.match(screen, /Finish/);
    assert.ok(LOGO_SMALL.length < LOGO.length);
    assert.ok(LOGO_SMALL.some((line) => line.includes('⣿')));
    const cols = Math.max(...LOGO.map((line) => line.length));
    assert.ok(cols / LOGO.length > 12, 'logo keeps the wide banner proportion');
    ui.animated = true;
    const colored = ui.screen(140, 64);
    const escape = String.fromCharCode(27);
    assert.ok(colored.includes(`${escape}[38;5;15m`));
    assert.equal(colored.includes(`${escape}[38;5;39m`), false);
});

test('masked input never renders the key and Ctrl+U clears it', async () => {
    const ui = terminal();
    ui.animated = true;
    ui.render = () => {};
    const pending = ui.secret('API key');
    ui.input('sensitive-api-key', {});
    assert.doesNotMatch(ui.screen(), /sensitive-api-key/);
    assert.match(ui.screen(), /•/);
    ui.input('', { ctrl: true, name: 'u' });
    ui.input('', { name: 'return' });
    assert.equal(await pending, '');
});

test('Ctrl+O opens the dashboard and does not become part of the key', async () => {
    const ui = terminal();
    ui.animated = true;
    ui.render = () => {};
    const opened = [];
    const pending = ui.secret(
        'Paste your secret key',
        ['Sign in with ICSSC. If you are not signed in, use your UCI Google account at https://antalmanac.com first.'],
        {
            url: 'https://dashboard.anteaterapi.com/',
            open: async (url) => {
                opened.push(url);
                return true;
            },
        }
    );
    const screen = ui.screen(80, 24).replaceAll(/\s+/g, ' ');
    assert.match(screen, /Ctrl\+O opens https:\/\/dashboard\.anteaterapi\.com\//);
    assert.match(screen, /Sign in with ICSSC/);
    assert.match(screen, /https:\/\/antalmanac\.com/);
    await ui.input('', { ctrl: true, name: 'o' });
    assert.deepEqual(opened, ['https://dashboard.anteaterapi.com/']);
    assert.match(ui.screen(80, 24), /Opened the dashboard in your browser/);
    assert.equal(ui.prompt.value, '');
    ui.input('key-with-o', {});
    assert.doesNotMatch(ui.screen(80, 24), /key-with-o/);
    ui.input('', { name: 'return' });
    assert.equal(await pending, 'key-with-o');
});

test('a failed browser open tells the user where to go', async () => {
    const ui = terminal();
    ui.animated = true;
    ui.render = () => {};
    const pending = ui.secret('Paste your secret key', [], {
        url: 'https://dashboard.anteaterapi.com/',
        open: async () => false,
    });
    await ui.input('', { ctrl: true, name: 'o' });
    assert.match(ui.screen(80, 24), /Could not open a browser/);
    assert.match(ui.screen(80, 24), /https:\/\/dashboard\.anteaterapi\.com\//);
    ui.input('', { name: 'return' });
    assert.equal(await pending, '');
});

test('the API key choices name the dashboard on a short screen', () => {
    const ui = terminal();
    ui.prompt = {
        title: 'Anteater API key',
        options: ['Open the dashboard in my browser', 'Paste a key I already have', 'Skip for now'],
        descriptions: ['Opens https://dashboard.anteaterapi.com/, then you paste the key here.'],
        lead: [
            'Create a secret key on the Anteater API dashboard.',
            'Sign in with ICSSC. If you are not signed in, use your UCI Google account at https://antalmanac.com first.',
        ],
        selected: 0,
    };
    for (const [columns, rows] of [
        [40, 16],
        [80, 24],
        [120, 40],
    ]) {
        const screen = ui.screen(columns, rows);
        const text = screen.replaceAll(/\s+/g, ' ');
        assert.match(text, /Open the dashboard in my browser/);
        assert.match(text, /dashboard\.anteaterapi\.com/);
        assert.match(screen, /Enter/);
        assert.ok(screen.split('\n').length < rows);
        assert.ok(screen.split('\n').every((line) => line.length < columns));
    }
});

test('openBrowser ignores anything other than an https URL', async () => {
    assert.equal(await openBrowser('file:///etc/passwd'), false);
    assert.equal(await openBrowser('http://example.com'), false);
});

test('API key instructions stay visible and the pasted key stays masked', async () => {
    const ui = terminal();
    ui.animated = true;
    ui.render = () => {};
    const instructions = formatApiKeyInstructions(
        'Paste the key below. Enter skips. It is stored only in apps/antalmanac/.env.'
    );
    const pending = ui.secret('Anteater API key', instructions);
    ui.input('sensitive-api-key', {});
    for (const [columns, rows] of [
        [100, 40],
        [80, 24],
    ]) {
        const screen = ui.screen(columns, rows);
        assert.match(screen, /https:\/\/dashboard\.anteaterapi\.com\//);
        assert.match(screen, /https:\/\/antalmanac\.com/);
        assert.match(screen, /Sign in with ICSSC/);
        assert.match(screen, /•/);
        assert.doesNotMatch(screen, /sensitive-api-key/);
        assert.ok(screen.split('\n').length < rows);
    }
    const cramped = ui.screen(40, 16);
    assert.match(cramped, /https:\/\/dashboard\.anteaterapi\.com\//);
    assert.match(cramped, /•/);
    assert.match(cramped, /Enter continue/);
    assert.doesNotMatch(cramped, /sensitive-api-key/);
    ui.input('', { name: 'return' });
    assert.equal(await pending, 'sensitive-api-key');
});

test('long failure reports scroll and return to the menu', async () => {
    const ui = terminal();
    ui.animated = true;
    ui.render = () => {};
    const pending = ui.details(Array.from({ length: 60 }, (_, index) => `Recovery instruction ${index}`));
    const first = ui.screen(80, 24);
    ui.input('', { name: 'pagedown' });
    const second = ui.screen(80, 24);
    assert.notEqual(first, second);
    assert.match(second, /Enter back/);
    ui.input('', { name: 'return' });
    await pending;
    assert.equal(ui.prompt, null);
});
