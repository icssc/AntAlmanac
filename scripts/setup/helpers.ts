import { type ExecException, exec } from 'node:child_process';
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
 * Runs a shell command and returns what it printed.
 * If the command fails, throws a {@link SetupError} that includes the command's output.
 */
export async function run(command: string, message: string, fix?: string) {
    try {
        const { stdout } = await execAsync(command);
        return stdout;
    } catch (error) {
        const { stdout, stderr } = error as ExecException;
        throw new SetupError(message, fix, stderr || stdout);
    }
}

export function readEnv(path: string) {
    return existsSync(path) ? parse(readFileSync(path)) : {};
}
