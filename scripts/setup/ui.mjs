import { emitKeypressEvents } from 'node:readline';
import { stripVTControlCharacters } from 'node:util';

import { LOGO, LOGO_SMALL } from './logo.mjs';

export function wrapText(text, width) {
    return String(text)
        .split('\n')
        .flatMap((line) => {
            const result = [];
            while (line.length > width) {
                const space = line.lastIndexOf(' ', width);
                const end = space > 0 ? space : width;
                result.push(line.slice(0, end));
                line = line.slice(end).trimStart();
            }
            return [...result, line];
        });
}

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const symbols = { pending: '○', running: '◌', done: '✓', blocked: '!', failed: '×', skipped: '–' };

function widest(lines) {
    return Math.max(...lines.map((line) => line.length));
}

export class Terminal {
    constructor({ plain = false } = {}) {
        this.interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY && process.env.TERM !== 'dumb');
        this.animated = this.interactive && !plain && !('NO_COLOR' in process.env);
        this.steps = [];
        this.logs = [];
        this.frame = 0;
        this.title = 'Your next great contribution starts here.';
    }

    color(code, text) {
        return this.animated ? `\x1b[${code}m${text}\x1b[0m` : text;
    }

    open() {
        if (this.animated) {
            process.stdout.write('\x1b[?1049h\x1b[?25l');
            this.timer = setInterval(() => {
                this.frame++;
                this.render();
            }, 90);
        } else {
            process.stdout.write(`\n${LOGO_SMALL.join('\n')}\n\n`);
        }
        if (this.interactive) {
            emitKeypressEvents(process.stdin);
            process.stdin.setRawMode(true);
            process.stdin.resume();
            this.onKey = (text, key) => {
                if (key?.ctrl && key.name === 'c') process.emit('SIGINT');
                else this.input?.(text, key);
            };
            process.stdin.on('keypress', this.onKey);
        }
        this.render();
    }

    close() {
        clearInterval(this.timer);
        if (this.interactive) {
            process.stdin.removeListener('keypress', this.onKey);
            process.stdin.setRawMode(false);
            process.stdin.pause();
        }
        if (this.animated) process.stdout.write('\x1b[?25h\x1b[?1049l');
    }

    logoLines(width, budget) {
        const ink = (text) => this.color('38;5;15', text);
        for (const candidate of [LOGO, LOGO_SMALL]) {
            const size = widest(candidate);
            const block = candidate.length + 2;
            if (size <= width && block <= budget) {
                const pad = ' '.repeat(Math.max(0, Math.floor((width - size) / 2)));
                return [
                    ...candidate.map((line) => ink(pad + line)),
                    '',
                    `  ${this.color('38;5;215', '●')} ${this.title}`,
                ];
            }
        }
        return null;
    }

    screen(columns = 80, rows = 30) {
        const width = Math.max(8, Math.min(104, columns - 4));
        const height = Math.max(3, rows - 1);
        const cyan = (text) => this.color('38;5;81', text);
        const muted = (text) => this.color('38;5;245', text);
        const complete = this.steps.filter((step) => step.status === 'done').length;
        const needsFix = this.steps.filter(
            (step) => ['blocked', 'failed'].includes(step.status) && step.id !== 'ready'
        );
        const active = this.steps.find((step) => step.status === 'running');
        const barLength = Math.min(24, Math.max(8, width - 30));
        const count = this.steps.length ? Math.round((complete / this.steps.length) * barLength) : 0;
        const elapsed = active?.started ? `${Math.floor((Date.now() - active.started) / 1000)}s` : '';
        const toolchain = process.env.ANTALMANAC_TOOLCHAIN === 'mise' ? 'MISE' : 'LOCAL';
        const footer = this.prompt?.lines
            ? '↑/↓ scroll · PgUp/PgDn · Enter back'
            : this.prompt
              ? this.prompt.options
                  ? '↑/↓ or j/k choose · Enter continue · Ctrl+C exit'
                  : 'Input hidden · Enter continue · Ctrl+U clear · Ctrl+C exit'
              : 'Ctrl+C stops setup · Completed work is kept';
        const budget = Math.max(1, height - 2);
        const main = [
            `${cyan('━'.repeat(count))}${muted('━'.repeat(barLength - count))}  ${complete}/${this.steps.length} ready${needsFix.length ? ` · ${needsFix.length} ${needsFix.length === 1 ? 'step' : 'steps'} to fix` : ''}  ${muted(toolchain)}`,
        ];

        if (this.prompt?.lines) {
            main.push('', this.color('1', this.prompt.title));
            const all = this.prompt.lines.flatMap((line) => wrapText(line, width));
            const logoBudget = budget - main.length - 3;
            const logo = this.logoLines(width, Math.max(0, logoBudget));
            const room = Math.max(1, budget - (logo?.length ?? 1) - main.length - 2);
            this.prompt.offset = Math.min(this.prompt.offset, Math.max(0, all.length - room));
            main.push(...all.slice(this.prompt.offset, this.prompt.offset + room));
            main.push('', muted(`↑/↓ scroll · PgUp/PgDn · Enter back  ${this.prompt.offset + 1}/${all.length}`));
            const header = logo ?? [cyan('ANTALMANAC / SETUP')];
            return this.fit([...header, ...main], width, height, muted(footer));
        }

        if ((!this.prompt || height >= 28) && !this.prompt?.instructions?.length) {
            main.push('');
            this.steps.forEach((step, index) => {
                const glyph = step.status === 'running' ? frames[this.frame % frames.length] : symbols[step.status];
                const tone =
                    step.status === 'done'
                        ? '38;5;114'
                        : ['failed', 'blocked'].includes(step.status)
                          ? '38;5;215'
                          : step.status === 'running'
                            ? '38;5;81'
                            : '38;5;245';
                const label = `${glyph}  ${String(index + 1).padStart(2, '0')}  ${step.label}`;
                main.push(this.color(tone, label) + (step.status === 'running' ? muted(`  ${elapsed}`) : ''));
                if (!this.prompt && step.summary && ['failed', 'blocked', 'skipped'].includes(step.status)) {
                    main.push(
                        ...wrapText(step.summary, Math.max(8, width - 6))
                            .slice(0, 2)
                            .map((line) => muted(`     ${line}`))
                    );
                }
            });
        }

        if (this.prompt) {
            if (this.prompt.options && needsFix.length) {
                main.push(
                    '',
                    this.color(
                        '38;5;203',
                        needsFix.length === 1 ? 'Fix this before continuing' : 'Fix these before continuing'
                    )
                );
                for (const step of needsFix) {
                    const text = `${symbols[step.status]}  ${step.label} — ${step.summary || 'Open the full report for the cause and the fix.'}`;
                    main.push(
                        ...wrapText(text, width)
                            .slice(0, 2)
                            .map((line) => this.color('38;5;203', line))
                    );
                }
            }
            main.push('', this.color('1', this.prompt.title));
            if (this.prompt.options) {
                this.prompt.options.forEach((option, index) =>
                    main.push(index === this.prompt.selected ? cyan(`❯ ${option}`) : muted(`  ${option}`))
                );
                const hint = this.prompt.descriptions?.[this.prompt.selected];
                if (hint) main.push('', ...wrapText(hint, width).slice(0, 3).map(muted));
            } else {
                if (this.prompt.instructions?.length) {
                    for (const line of this.prompt.instructions) main.push(...wrapText(line, width).map(muted));
                }
                main.push(
                    cyan('› ') +
                        (this.prompt.value
                            ? '•'.repeat(Math.min(this.prompt.value.length, 40))
                            : muted('Paste your key, or Enter to skip'))
                );
                main.push(muted('Stored only in your local .env. Never shown in logs.'));
            }
        } else {
            const room = 6;
            main.push('', cyan(active ? `LIVE OUTPUT / ${active.label}` : 'WORKSPACE STATUS'));
            if (this.command) main.push(muted(`$ ${this.command}`));
            main.push(...this.logs.slice(-room).map(muted));
        }

        const logo = this.logoLines(width, budget - main.length);
        const header = logo ?? [
            cyan('ANTALMANAC') + muted('  /  developer setup'),
            `  ${this.color('38;5;215', '●')} ${this.title}`,
        ];
        const keepTail = Boolean(this.prompt?.instructions?.length || this.prompt?.options);
        return this.fit([...header, ...main], width, height, muted(footer), keepTail);
    }

    fit(lines, width, height, footer, keepTail = false) {
        const budget = Math.max(1, height - 2);
        const visible = keepTail && lines.length > budget ? lines.slice(-budget) : lines.slice(0, budget);
        return [...visible, '', footer]
            .slice(0, height)
            .map((line) => {
                const plain = stripVTControlCharacters(line);
                return '  ' + (plain.length > width ? plain.slice(0, width - 1) + '…' : line);
            })
            .join('\n');
    }

    render() {
        if (!this.animated) return;
        const screen = this.screen(process.stdout.columns || 80, process.stdout.rows || 30);
        if (screen !== this.lastScreen) process.stdout.write('\x1b[H\x1b[J' + screen);
        this.lastScreen = screen;
    }

    status(step, status, detail) {
        step.status = status;
        if (status === 'running') {
            step.started = Date.now();
            this.logs = [];
            this.command = '';
        }
        step.detail = detail;
        step.summary = ['failed', 'blocked', 'skipped'].includes(status)
            ? detail
                  ?.split('\n')
                  .find((line) => line.trim())
                  ?.trim() || ''
            : '';
        if (!this.animated) {
            const [first, ...rest] = (detail || '').split('\n');
            process.stdout.write(`  ${symbols[status]} ${step.label}${first ? ` — ${first}` : ''}\n`);
            for (const line of rest) process.stdout.write(`    ${line}\n`);
        }
        if (detail) this.logs = detail.split('\n');
        this.render();
    }

    output(text) {
        this.logs = text
            .split(/[\r\n]+/)
            .filter(Boolean)
            .slice(-5);
        if (!this.animated && Date.now() - (this.lastOutputAt || 0) > 1000 && this.logs.length) {
            process.stdout.write(`    ${this.logs.at(-1)}\n`);
            this.lastOutputAt = Date.now();
        }
        this.render();
    }

    choose(title, options, descriptions = []) {
        this.prompt = { title, options, descriptions, selected: 0 };
        if (!this.animated)
            process.stdout.write(
                `${title}\n${options.map((value, index) => `  ${index + 1}. ${value}`).join('\n')}\nUse ↑/↓ or a number, then Enter.\n`
            );
        this.render();
        return new Promise((resolve) => {
            this.input = (text, key) => {
                if (key?.name === 'up' || text === 'k')
                    this.prompt.selected = (this.prompt.selected + options.length - 1) % options.length;
                if (key?.name === 'down' || text === 'j')
                    this.prompt.selected = (this.prompt.selected + 1) % options.length;
                if (/^[1-9]$/.test(text) && Number(text) <= options.length) this.prompt.selected = Number(text) - 1;
                if (key?.name === 'return') {
                    const selected = this.prompt.selected;
                    this.prompt = null;
                    this.input = null;
                    resolve(selected);
                } else if (!this.animated) process.stdout.write(`  › ${options[this.prompt.selected]}\n`);
                this.render();
            };
        });
    }

    details(lines) {
        this.prompt = { title: 'What happened, and how to fix it', lines, offset: 0 };
        if (!this.animated) process.stdout.write(`${lines.join('\n')}\nPress Enter to return.\n`);
        this.render();
        return new Promise((resolve) => {
            this.input = (text, key) => {
                if (['return', 'escape'].includes(key?.name)) {
                    this.prompt = null;
                    this.input = null;
                    resolve();
                } else {
                    if (key?.name === 'up' || text === 'k') this.prompt.offset = Math.max(0, this.prompt.offset - 1);
                    if (key?.name === 'down' || text === 'j') this.prompt.offset++;
                    if (key?.name === 'pageup') this.prompt.offset = Math.max(0, this.prompt.offset - 8);
                    if (key?.name === 'pagedown') this.prompt.offset += 8;
                    if (key?.name === 'home') this.prompt.offset = 0;
                }
                this.render();
            };
        });
    }

    secret(title, instructions = []) {
        this.prompt = { title, value: '', instructions };
        if (!this.animated)
            process.stdout.write(
                `${title}\n${instructions.length ? `${instructions.join('\n')}\n` : ''}(input hidden; Enter to skip)\n`
            );
        this.render();
        return new Promise((resolve) => {
            this.input = (text, key) => {
                if (key?.name === 'return') {
                    const value = this.prompt.value.trim();
                    this.prompt = null;
                    this.input = null;
                    resolve(value);
                } else if (key?.ctrl && key.name === 'u') this.prompt.value = '';
                else if (key?.name === 'backspace') this.prompt.value = this.prompt.value.slice(0, -1);
                else if (
                    text &&
                    !key?.ctrl &&
                    !key?.meta &&
                    [...text].every((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127)
                )
                    this.prompt.value += text;
                this.render();
            };
        });
    }
}
