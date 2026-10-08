import assert from 'node:assert/strict';
import test from 'node:test';

import { formatApiKeyInstructions } from './core.mjs';
import { LOGO, LOGO_SMALL } from './logo.mjs';
import { Terminal } from './ui.mjs';

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
