import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Version drift breaks setup before the wizard can help. No TOML dependency needed for these literal pins.
test('mise, nvm, and packageManager select the same toolchain', () => {
    const config = readFileSync(new URL('../../mise.toml', import.meta.url), 'utf8');
    const node = readFileSync(new URL('../../.nvmrc', import.meta.url), 'utf8').trim();
    const { packageManager } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    assert.equal(config.match(/^node = "([^"]+)"/m)?.[1], node);
    assert.equal(`pnpm@${config.match(/^pnpm = "([^"]+)"/m)?.[1]}`, packageManager);
});
