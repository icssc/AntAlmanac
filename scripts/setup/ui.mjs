import { emitKeypressEvents } from 'node:readline';
import { stripVTControlCharacters } from 'node:util';

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
            process.stdout.write('\n  ANTALMANAC / developer setup\n  A little guidance. A great place to build.\n\n');
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

    screen(columns = 80, rows = 30) {
        const width = Math.max(8, Math.min(104, columns - 4));
        const height = Math.max(3, rows - 1);
        const cyan = (s) => this.color('38;5;81', s);
        const muted = (s) => this.color('38;5;245', s);
        const complete = this.steps.filter((s) => s.status === 'done').length;
        const blocked = this.steps.filter((s) => ['blocked', 'failed'].includes(s.status)).length;
        const active = this.steps.find((s) => s.status === 'running');
        const barLength = Math.min(24, Math.max(8, width - 30));
        const count = this.steps.length ? Math.round((complete / this.steps.length) * barLength) : 0;
        const elapsed = active?.started ? `${Math.floor((Date.now() - active.started) / 1000)}s` : '';
        const toolchain = process.env.ANTALMANAC_TOOLCHAIN === 'mise' ? 'MISE' : 'LOCAL';
        const lines =
            height >= 18
                ? [
                      cyan(`╭${'─'.repeat(width - 2)}╮`),
                      `  ${this.color('1;38;5;81', 'A N T A L M A N A C')}  ${muted('/ DEVELOPER WORKSPACE')}`,
                      `  ${this.color('38;5;215', '●')} ${this.title}`,
                      cyan(`╰${'─'.repeat(width - 2)}╯`),
                  ]
                : [cyan('ANTALMANAC / SETUP')];
        lines.push(
            `${cyan('━'.repeat(count))}${muted('━'.repeat(barLength - count))}  ${complete}/${this.steps.length} ready${blocked ? ` · ${blocked} need attention` : ''}  ${muted(toolchain)}`
        );

        if (this.prompt?.lines) {
            lines.push('', this.color('1', this.prompt.title));
            const all = this.prompt.lines.flatMap((line) => wrapText(line, width));
            const room = Math.max(1, height - lines.length - 2);
            this.prompt.offset = Math.min(this.prompt.offset, Math.max(0, all.length - room));
            lines.push(...all.slice(this.prompt.offset, this.prompt.offset + room));
            lines.push('', muted(`↑/↓ scroll · PgUp/PgDn · Enter back  ${this.prompt.offset + 1}/${all.length}`));
        } else {
            // Keep the menu visible even on small terminals; never clip the active input.
            if (!this.prompt || height >= 28) {
                lines.push('');
                this.steps.forEach((step, i) => {
                    const glyph = step.status === 'running' ? frames[this.frame % frames.length] : symbols[step.status];
                    const tone =
                        step.status === 'done'
                            ? '38;5;114'
                            : ['failed', 'blocked'].includes(step.status)
                              ? '38;5;215'
                              : step.status === 'running'
                                ? '38;5;81'
                                : '38;5;245';
                    const label = `${glyph}  ${String(i + 1).padStart(2, '0')}  ${step.label}`;
                    lines.push(this.color(tone, label) + (step.status === 'running' ? muted(`  ${elapsed}`) : ''));
                });
            }
            if (this.prompt) {
                lines.push('', this.color('1', this.prompt.title));
                if (this.prompt.options) {
                    this.prompt.options.forEach((option, i) =>
                        lines.push(i === this.prompt.selected ? cyan(`❯ ${option}`) : muted(`  ${option}`))
                    );
                    const hint = this.prompt.descriptions?.[this.prompt.selected];
                    if (hint)
                        lines.push(
                            '',
                            ...wrapText(hint, width)
                                .slice(0, Math.max(1, height - lines.length - 3))
                                .map(muted)
                        );
                } else {
                    lines.push(
                        cyan('› ') +
                            (this.prompt.value
                                ? '•'.repeat(Math.min(this.prompt.value.length, 40))
                                : muted('Paste your key, or Enter to skip'))
                    );
                    lines.push(muted('Stored only in your local .env. Never shown in logs.'));
                }
            } else {
                const room = Math.max(0, height - lines.length - 5);
                lines.push('', cyan(active ? `LIVE OUTPUT / ${active.label}` : 'WORKSPACE STATUS'));
                if (this.command && room > 1) lines.push(muted(`$ ${this.command}`));
                if (room > 0) lines.push(...this.logs.slice(-Math.min(room, 6)).map(muted));
            }
            const footer = this.prompt
                ? this.prompt.options
                    ? '↑/↓ or j/k choose · Enter continue · Ctrl+C exit'
                    : 'Input hidden · Enter continue · Ctrl+U clear · Ctrl+C exit'
                : 'Ctrl+C stops setup · Completed work is kept';
            // Reserve the final line for controls at every supported terminal size.
            lines.splice(height - 2);
            lines.push('', muted(footer));
        }
        return lines
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
        if (!this.animated) process.stdout.write(`  ${symbols[status]} ${step.label}${detail ? ` — ${detail}` : ''}\n`);
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
                `${title}\n${options.map((v, i) => `  ${i + 1}. ${v}`).join('\n')}\nUse ↑/↓ or a number, then Enter.\n`
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
        this.prompt = { title: 'Results & recovery steps', lines, offset: 0 };
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

    secret(title) {
        this.prompt = { title, value: '' };
        if (!this.animated) process.stdout.write(`${title} (input hidden; Enter to skip)\n`);
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
