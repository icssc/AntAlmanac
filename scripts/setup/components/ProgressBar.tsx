import { Box, Text } from 'ink';

const WIDTH = 24;

interface ProgressBarProps {
    done: number;
    skipped: number;
    total: number;
}

export function ProgressBar({ done, skipped, total }: ProgressBarProps) {
    const filled = Math.round(((done + skipped) / total) * WIDTH);

    return (
        <Box gap={2}>
            <Text>
                <Text color="cyan">{'━'.repeat(filled)}</Text>
                <Text dimColor>{'─'.repeat(WIDTH - filled)}</Text>
            </Text>

            <Text>
                {done}/{total} ready
                {skipped > 0 && <Text dimColor> · {skipped} skipped</Text>}
            </Text>
        </Box>
    );
}
