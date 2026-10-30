import { type ExecException, exec } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { existsSync, readFileSync } from 'node:fs';
import { promisify } from 'node:util';

import { parse } from 'dotenv';

const execAsync = promisify(exec);

export class SetupError extends Error {
    fix?: string;
    output?: string;

    constructor(message: string, fix?: string, output?: string) {
        super(message);
        this.name = 'SetupError';
        this.fix = fix;
        this.output = output;
    }
}

/**
 * Emits each command that {@link run} starts and everything it prints, so the UI can show it live.
 */
export const commandEvents = new EventEmitter<{ command: [string]; output: [string] }>();

/**
 * Runs a shell command and returns what it printed.
 * If the command fails, throws a {@link SetupError} that includes the command's output.
 */
export async function run(command: string, message: string, fix?: string) {
    commandEvents.emit('command', command);

    const promise = execAsync(command);
    promise.child.stdout?.on('data', (data) => commandEvents.emit('output', String(data)));
    promise.child.stderr?.on('data', (data) => commandEvents.emit('output', String(data)));

    try {
        const { stdout } = await promise;
        return stdout;
    } catch (error) {
        const { stdout, stderr, message: reason } = error as ExecException;
        throw new SetupError(message, fix, stderr || stdout || reason);
    }
}

export function readEnv(path: string) {
    return existsSync(path) ? parse(readFileSync(path)) : {};
}
