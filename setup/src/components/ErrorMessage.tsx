import type { SetupError } from '$src/helpers';
import { Box, Text } from 'ink';

const MAX_OUTPUT_LINES = 8;

interface ErrorMessageProps {
    error: SetupError;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
    const output = error.output?.trim().split('\n').slice(-MAX_OUTPUT_LINES).join('\n');

    return (
        <Box flexDirection="column" alignSelf="flex-start" borderStyle="round" borderColor="red" paddingX={1}>
            <Text bold color="red">
                {error.message}
            </Text>

            {error.fix && (
                <Text>
                    <Text color="cyan">→</Text> {error.fix}
                </Text>
            )}

            {output && (
                <Box marginTop={1}>
                    <Text dimColor>{output}</Text>
                </Box>
            )}
        </Box>
    );
}
