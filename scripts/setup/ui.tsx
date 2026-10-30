import { PasswordInput, Select, Spinner } from '@inkjs/ui';
import { Box, Static, Text, useStdout } from 'ink';
import { useSyncExternalStore } from 'react';

import { LOGO, LOGO_SMALL } from './logo';

type Status = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

interface StepState {
    id: string;
    label: string;
    status: Status;
    detail?: string;
    fix?: string[];
    output?: string[];
}

type PromptInput = { title: string; lines: string[] } & (
    | { kind: 'select'; options: { label: string; value: string }[] }
    | { kind: 'secret' }
);
type Prompt = PromptInput & { id: number; resolve: (value: string) => void };

interface State {
    title: string;
    steps: StepState[];
    command?: string;
    output: string[];
    prompt?: Prompt;
    note?: string;
    showCommands?: boolean;
}

let state: State = { title: '', steps: [], output: [] };
const listeners = new Set<() => void>();

export const getState = () => state;

export function update(patch: Partial<State>) {
    state = { ...state, ...patch };
    listeners.forEach((listener) => listener());
}

export function updateStep(id: string, patch: Partial<StepState>) {
    update({ steps: state.steps.map((step) => (step.id === id ? { ...step, ...patch } : step)) });
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
}

let promptId = 0;
function ask(prompt: PromptInput) {
    return new Promise<string>((resolve) => {
        const done = (value: string) => {
            update({ prompt: undefined });
            resolve(value);
        };
        update({ prompt: { ...prompt, id: ++promptId, resolve: done } });
    });
}

export function select<T extends string>(title: string, choices: Record<T, string>, lines: string[] = []) {
    const options = Object.entries<string>(choices).map(([value, label]) => ({ label, value }));
    return ask({ kind: 'select', title, lines, options }) as Promise<T>;
}

export const secret = (title: string, lines: string[]) => ask({ kind: 'secret', title, lines });

const ICONS: Record<Exclude<Status, 'running'>, [string, string?]> = {
    pending: ['○'],
    done: ['✓', 'green'],
    failed: ['✗', 'red'],
    skipped: ['–'],
};

const COMMANDS = [
    ['pnpm dev', 'Start the development server'],
    ['pnpm db:start', 'Start the database'],
    ['pnpm db:stop', 'Stop the database'],
];

function Step({ label, status, detail, fix = [], output = [] }: StepState) {
    const [icon, color] = status === 'running' ? [] : ICONS[status];
    const muted = status === 'pending' || status === 'skipped';
    return (
        <Box flexDirection="column">
            <Box gap={1}>
                <Box width={36} flexShrink={0} gap={1}>
                    {status === 'running' ? <Spinner /> : <Text color={color}>{icon}</Text>}
                    <Text dimColor={muted}>{label}</Text>
                </Box>
                {status !== 'failed' && <Text dimColor>{detail}</Text>}
            </Box>
            {status === 'failed' && (
                <Box flexDirection="column" paddingLeft={2}>
                    <Text color="red">{detail}</Text>
                    {fix.map((line) => (
                        <Box key={line}>
                            <Box width={2} flexShrink={0}>
                                <Text>→</Text>
                            </Box>
                            <Text>{line}</Text>
                        </Box>
                    ))}
                    <Box flexDirection="column" paddingLeft={2}>
                        {output.map((line, index) => (
                            <Text key={index} dimColor>
                                {line}
                            </Text>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
}

function PromptView({ prompt }: { prompt: Prompt }) {
    return (
        <Box flexDirection="column" alignSelf="flex-start" borderStyle="round" paddingX={1}>
            <Text bold>{prompt.title}</Text>
            {prompt.lines.map((line) => (
                <Text key={line}>{line}</Text>
            ))}
            <Box marginTop={prompt.lines.length ? 1 : 0}>
                {prompt.kind === 'select' ? (
                    <Select options={prompt.options} onChange={prompt.resolve} />
                ) : (
                    <PasswordInput placeholder="Paste your key, or press Enter to skip" onSubmit={prompt.resolve} />
                )}
            </Box>
        </Box>
    );
}

export function App() {
    const { title, steps, command, output, prompt, note, showCommands } = useSyncExternalStore(subscribe, getState);
    const { columns } = useStdout().stdout;
    const logo = columns >= 100 ? LOGO : columns >= 84 ? LOGO_SMALL : ['ANTALMANAC'];
    return (
        <>
            <Static items={[logo]}>
                {(lines) => (
                    <Box key="logo" flexDirection="column" padding={1} paddingLeft={2}>
                        {lines.map((line) => (
                            <Text key={line}>{line}</Text>
                        ))}
                    </Box>
                )}
            </Static>
            <Box flexDirection="column" paddingX={2} paddingBottom={1} gap={1}>
                <Text bold>{title}</Text>
                {steps.length > 0 && (
                    <Box flexDirection="column">
                        {steps.map((step) => (
                            <Step key={step.id} {...step} />
                        ))}
                    </Box>
                )}
                {command && (
                    <Box flexDirection="column">
                        <Text dimColor>$ {command}</Text>
                        {output.map((line, index) => (
                            <Text key={index} dimColor wrap="truncate-end">
                                {line}
                            </Text>
                        ))}
                    </Box>
                )}
                {showCommands && (
                    <Box flexDirection="column">
                        {COMMANDS.map(([name, description]) => (
                            <Box key={name} gap={2}>
                                <Box width={14}>
                                    <Text color="cyan">{name}</Text>
                                </Box>
                                <Text dimColor>{description}</Text>
                            </Box>
                        ))}
                    </Box>
                )}
                {prompt && <PromptView key={prompt.id} prompt={prompt} />}
                {note && <Text>{note}</Text>}
            </Box>
        </>
    );
}
