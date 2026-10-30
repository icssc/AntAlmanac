import { Spinner } from '@inkjs/ui';
import { Box, Text } from 'ink';

import type { StepStatus } from './types';

interface StepItemProps {
    label: string;
    status: StepStatus;
    detail?: string;
}

export function StepItem({ label, status, detail }: StepItemProps) {
    return (
        <Box gap={1}>
            <Box width={20} flexShrink={0} gap={1}>
                {status === 'pending' && <Text dimColor>○</Text>}
                {status === 'running' && <Spinner />}
                {status === 'done' && <Text color="green">✓</Text>}
                {status === 'failed' && <Text color="red">✗</Text>}

                <Text dimColor={status === 'pending'}>{label}</Text>
            </Box>

            {detail && <Text dimColor>{detail}</Text>}
        </Box>
    );
}
