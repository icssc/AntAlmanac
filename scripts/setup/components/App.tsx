import { Box, Text, useApp, useStdin } from 'ink';
import { useEffect, useState } from 'react';

import { SetupError } from '../helpers';
import type { SetupStep, StepResult, StepStatus } from '../types';
import { ErrorMessage } from './ErrorMessage';
import { InputPrompt } from './InputPrompt';
import { Logo } from './Logo';
import { SkipPrompt } from './SkipPrompt';
import { StepItem } from './StepItem';

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

    const [results, setResults] = useState<StepResult[]>([]);
    const [error, setError] = useState<SetupError>();

    const currentIndex = results.length;
    const currentStep = steps.at(currentIndex);
    const isFinished = !currentStep;
    const hasSkipped = results.some((result) => result.status === 'skipped');

    const canAsk = error !== undefined && isRawModeSupported;
    const prompt = canAsk ? currentStep?.prompt : undefined;
    const canSkip = canAsk && currentStep?.skippable === true;

    useEffect(() => {
        if (!currentStep || error) {
            return;
        }

        currentStep
            .run()
            .then((detail) => {
                setResults((previous) => [...previous, { status: 'done', detail }]);
            })
            .catch((error: unknown) => {
                setError(error instanceof SetupError ? error : new SetupError(String(error)));
            });
    }, [currentStep, error]);

    useEffect(() => {
        if (isFinished) {
            exit();
        } else if (error && !prompt && !canSkip) {
            exit(error);
        }
    }, [isFinished, error, prompt, canSkip, exit]);

    function getStatus(index: number): StepStatus {
        if (index < currentIndex) {
            return results[index].status;
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

    function handleSkip() {
        let count = 1;
        while (steps[currentIndex + count]?.needsPreviousStep) {
            count++;
        }

        const skipped: StepResult[] = Array.from({ length: count }, () => ({ status: 'skipped', detail: 'Skipped' }));
        setResults((previous) => [...previous, ...skipped]);
        setError(undefined);
    }

    return (
        <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
            <Logo />

            <Box flexDirection="column">
                {steps.map((step, index) => (
                    <StepItem
                        key={step.label}
                        label={step.label}
                        status={getStatus(index)}
                        detail={results[index]?.detail}
                    />
                ))}
            </Box>

            {error && <ErrorMessage error={error} />}

            {prompt && <InputPrompt message={prompt.message} onSubmit={handleSubmit} />}

            {canSkip && (
                <SkipPrompt onRetry={() => setError(undefined)} onSkip={handleSkip} onQuit={() => exit(error)} />
            )}

            {error && !prompt && !canSkip && <Text>Fix the problem above, then run this command again.</Text>}

            {isFinished && hasSkipped && (
                <Text color="yellow">Some steps were skipped. Run this command again to finish them.</Text>
            )}

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
