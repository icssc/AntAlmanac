import { PasswordInput } from '@inkjs/ui';
import { Box, Text, useApp, useStdin } from 'ink';
import { useEffect, useState } from 'react';

import { ErrorMessage } from './ErrorMessage';
import { SetupError } from './helpers';
import { Logo } from './Logo';
import { StepItem } from './StepItem';
import type { SetupStep, StepStatus } from './types';

const DEV_COMMANDS = [
    { command: 'pnpm dev', description: 'Start the development server' },
    { command: 'pnpm db:start', description: 'Start the database' },
    { command: 'pnpm db:stop', description: 'Stop the database' },
];

interface AppProps {
    steps: SetupStep[];
}

export function App({ steps }: AppProps) {
    const { exit } = useApp();
    const { isRawModeSupported } = useStdin();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [details, setDetails] = useState<string[]>([]);
    const [error, setError] = useState<SetupError>();

    const currentStep = steps.at(currentIndex);
    const isFinished = !currentStep;
    const prompt = error && isRawModeSupported ? currentStep?.prompt : undefined;

    useEffect(() => {
        if (!currentStep || error) {
            return;
        }

        currentStep
            .run()
            .then((detail) => {
                setDetails((previous) => [...previous, detail]);
                setCurrentIndex((previous) => previous + 1);
            })
            .catch((error: unknown) => {
                setError(error instanceof SetupError ? error : new SetupError(String(error)));
            });
    }, [currentStep, error]);

    useEffect(() => {
        if (isFinished) {
            exit();
        } else if (error && !prompt) {
            exit(error);
        }
    }, [isFinished, error, prompt, exit]);

    function getStatus(index: number): StepStatus {
        if (index < currentIndex) {
            return 'done';
        }
        if (index > currentIndex) {
            return 'pending';
        }
        return error ? 'failed' : 'running';
    }

    function handleSubmit(value: string) {
        if (!value.trim()) {
            exit(error);
            return;
        }

        prompt?.onSubmit(value.trim());
        setError(undefined);
    }

    return (
        <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
            <Logo />

            <Box flexDirection="column">
                {steps.map((step, index) => (
                    <StepItem key={step.label} label={step.label} status={getStatus(index)} detail={details[index]} />
                ))}
            </Box>

            {error && <ErrorMessage error={error} />}

            {prompt && (
                <Box gap={1}>
                    <Text bold>{prompt.message}</Text>
                    <PasswordInput placeholder="or press Enter to quit" onSubmit={handleSubmit} />
                </Box>
            )}

            {error && !prompt && <Text>Fix the problem above, then run this command again.</Text>}

            {isFinished && (
                <Box flexDirection="column">
                    {DEV_COMMANDS.map(({ command, description }) => (
                        <Box key={command} gap={2}>
                            <Box width={14}>
                                <Text color="cyan">{command}</Text>
                            </Box>
                            <Text dimColor>{description}</Text>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}
