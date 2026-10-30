import { Box, Text, useApp, useStdin } from 'ink';
import { useEffect, useState } from 'react';

import { SetupError } from '../helpers';
import type { SetupStep, StepResult, StepStatus } from '../types';
import { CommandOutput } from './CommandOutput';
import { ConfirmPrompt } from './ConfirmPrompt';
import { ErrorMessage } from './ErrorMessage';
import { Header } from './Header';
import { InputPrompt } from './InputPrompt';
import { SkipPrompt } from './SkipPrompt';
import { StepItem } from './StepItem';
import { Summary } from './Summary';

type Confirmation = 'pending' | 'confirmed' | 'cancelled';

interface AppProps {
    steps: SetupStep[];
}

export function App({ steps }: AppProps) {
    const { exit } = useApp();
    const { isRawModeSupported } = useStdin();

    const [confirmation, setConfirmation] = useState<Confirmation>(isRawModeSupported ? 'pending' : 'confirmed');
    const [results, setResults] = useState<StepResult[]>([]);
    const [error, setError] = useState<SetupError>();

    const isConfirmed = confirmation === 'confirmed';
    const currentIndex = results.length;
    const currentStep = steps.at(currentIndex);
    const isFinished = !currentStep;
    const isRunning = isConfirmed && !isFinished && !error;
    const skippedLabels = steps
        .filter((step, index) => step.skippable && results[index]?.status === 'skipped')
        .map((step) => step.label);

    const canAsk = error !== undefined && isRawModeSupported;
    const prompt = canAsk ? currentStep?.prompt : undefined;
    const canSkip = canAsk && currentStep?.skippable === true;
    const isStopped = error !== undefined && !prompt && !canSkip;

    useEffect(() => {
        if (!isConfirmed || !currentStep || error) {
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
    }, [isConfirmed, currentStep, error]);

    useEffect(() => {
        if (isFinished || confirmation === 'cancelled') {
            exit();
        } else if (isStopped) {
            exit(error);
        }
    }, [isFinished, isStopped, confirmation, error, exit]);

    function getStatus(index: number): StepStatus {
        if (index < currentIndex) {
            return results[index].status;
        }
        if (index > currentIndex || !isConfirmed) {
            return 'pending';
        }
        return error ? 'failed' : 'running';
    }

    function getHint() {
        if (confirmation === 'pending') {
            return 'Y to start · N to cancel';
        }
        if (canSkip) {
            return '↑/↓ to choose · Enter to confirm · Ctrl+C to quit';
        }
        if (isRunning) {
            return 'Ctrl+C stops setup · Finished steps are kept';
        }
    }

    function handleSubmit(value: string) {
        prompt?.onSubmit(value);
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

    const hint = getHint();

    return (
        <Box flexDirection="column" paddingX={2} paddingY={1} gap={1}>
            <Header />

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

            {confirmation === 'pending' && (
                <ConfirmPrompt
                    onConfirm={() => setConfirmation('confirmed')}
                    onCancel={() => setConfirmation('cancelled')}
                />
            )}

            {confirmation === 'cancelled' && <Text>Setup cancelled. Nothing was changed.</Text>}

            {isRunning && <CommandOutput key={currentIndex} />}

            {error && <ErrorMessage error={error} />}

            {prompt && (
                <InputPrompt
                    message={prompt.message}
                    note={prompt.note}
                    url={prompt.url}
                    onSubmit={handleSubmit}
                    onQuit={() => exit(error)}
                />
            )}

            {canSkip && (
                <SkipPrompt
                    label={currentStep.label}
                    onRetry={() => setError(undefined)}
                    onSkip={handleSkip}
                    onQuit={() => exit(error)}
                />
            )}

            {isFinished && <Summary skippedLabels={skippedLabels} />}

            {isStopped && <Text>Fix the problem above, then run this command again.</Text>}

            {hint && <Text dimColor>{hint}</Text>}
        </Box>
    );
}
