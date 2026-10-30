import { Box, Text, useApp, useStdin } from 'ink';
import { useEffect, useState } from 'react';

import { SetupError } from '../helpers';
import type { SetupStep, StepResult, StepStatus } from '../types';
import { ErrorMessage } from './ErrorMessage';
import { InputPrompt } from './InputPrompt';
import { Logo } from './Logo';
import { ProgressBar } from './ProgressBar';
import { SkipPrompt } from './SkipPrompt';
import { StepItem } from './StepItem';
import { Summary } from './Summary';

interface AppProps {
    title: string;
    steps: SetupStep[];
}

export function App({ title, steps }: AppProps) {
    const { exit } = useApp();
    const { isRawModeSupported } = useStdin();

    const [results, setResults] = useState<StepResult[]>([]);
    const [error, setError] = useState<SetupError>();

    const currentIndex = results.length;
    const currentStep = steps.at(currentIndex);
    const isFinished = !currentStep;
    const doneCount = results.filter((result) => result.status === 'done').length;
    const skippedCount = results.length - doneCount;

    const canAsk = error !== undefined && isRawModeSupported;
    const prompt = canAsk ? currentStep?.prompt : undefined;
    const canSkip = canAsk && currentStep?.skippable === true;
    const isStopped = error !== undefined && !prompt && !canSkip;

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
        } else if (isStopped) {
            exit(error);
        }
    }, [isFinished, isStopped, error, exit]);

    function getStatus(index: number): StepStatus {
        if (index < currentIndex) {
            return results[index].status;
        }
        if (index > currentIndex) {
            return 'pending';
        }
        return error ? 'failed' : 'running';
    }

    function getHint() {
        if (prompt) {
            return 'Input is hidden · Enter to submit · Ctrl+C to quit';
        }
        if (canSkip) {
            return '↑/↓ to choose · Enter to confirm · Ctrl+C to quit';
        }
        return 'Ctrl+C stops setup · Finished steps are kept';
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
            <Box flexDirection="column" gap={1}>
                <Logo />
                <Text>
                    <Text color="yellow">●</Text> {title}
                </Text>
            </Box>

            <ProgressBar done={doneCount} skipped={skippedCount} total={steps.length} />

            <Box flexDirection="column">
                {steps.map((step, index) => (
                    <StepItem
                        key={step.label}
                        number={index + 1}
                        label={step.label}
                        status={getStatus(index)}
                        detail={results[index]?.detail}
                    />
                ))}
            </Box>

            {error && <ErrorMessage error={error} />}

            {prompt && <InputPrompt message={prompt.message} note={prompt.note} onSubmit={handleSubmit} />}

            {canSkip && (
                <SkipPrompt
                    label={currentStep.label}
                    onRetry={() => setError(undefined)}
                    onSkip={handleSkip}
                    onQuit={() => exit(error)}
                />
            )}

            {isFinished && <Summary hasSkipped={skippedCount > 0} />}

            {isStopped && <Text>Fix the problem above, then run this command again.</Text>}

            {!isFinished && !isStopped && <Text dimColor>{getHint()}</Text>}
        </Box>
    );
}
