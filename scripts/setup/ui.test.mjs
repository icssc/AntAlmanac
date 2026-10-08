import assert from 'node:assert/strict';
import test from 'node:test';

import { Terminal } from './ui.mjs';

function terminal() {
    const ui = new Terminal({ plain: true });
    ui.steps = ['Tools', 'Dependencies', 'Credentials', 'Database', 'Migrations', 'Course data', 'Ready'].map(
        (label) => ({ label, status: 'pending' })
    );
    return ui;
}

test('menus and keyboard controls remain visible at small terminal sizes', () => {
    const ui = terminal();
    ui.prompt = {
        title: 'Next step',
        options: ['Retry unfinished steps', 'Inspect results', 'Finish'],
        selected: 0,
        descriptions: ['Fix the reported issues, then retry.'],
    };
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

test('long failure reports scroll and return to the menu', async () => {
    const ui = terminal();
    ui.animated = true;
    ui.render = () => {};
    const pending = ui.details(Array.from({ length: 60 }, (_, i) => `Recovery instruction ${i}`));
    const first = ui.screen(80, 24);
    ui.input('', { name: 'pagedown' });
    const second = ui.screen(80, 24);
    assert.notEqual(first, second);
    assert.match(second, /Enter back/);
    ui.input('', { name: 'return' });
    await pending;
    assert.equal(ui.prompt, null);
});
