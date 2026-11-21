import type { StepStatus } from '$src/types';
import { Spinner } from '@inkjs/ui';
import { Box, Text } from 'ink';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<StepStatus, string | undefined> = {
    pending: undefined,
    running: 'cyan',
    done: 'green',
    skipped: undefined,
    failed: 'red',
};

const STATUS_SYMBOLS: Record<Exclude<StepStatus, 'running'>, string> = {
    pending: '○',
    done: '✓',
    skipped: '–',
    failed: '✗',
};

interface StepItemProps {
    number: number;
    label: string;
    status: StepStatus;
    detail?: string;
}

export function StepItem({ number, label, status, detail }: StepItemProps) {
    const color = STATUS_COLORS[status];
    const isDim = status === 'pending' || status === 'skipped';

    return (
        <Box gap={2}>
            <Box width={1}>
                {status === 'running' ? (
                    <Spinner />
                ) : (
                    <Text color={color} dimColor={isDim}>
                        {STATUS_SYMBOLS[status]}
                    </Text>
                )}
            </Box>

            <Text dimColor>{String(number).padStart(2, '0')}</Text>

            <Box width={18} flexShrink={0}>
                <Text color={color} dimColor={isDim}>
                    {label}
                </Text>
            </Box>

            {status === 'running' ? <ElapsedTime /> : detail && <Text dimColor>{detail}</Text>}
        </Box>
    );
}

function ElapsedTime() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setSeconds((previous) => previous + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    return <Text dimColor>{seconds > 0 && `${seconds}s`}</Text>;
}
