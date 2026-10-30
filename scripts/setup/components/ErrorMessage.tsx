import { Box, Text } from 'ink';

import type { SetupError } from '../helpers';

const MAX_OUTPUT_LINES = 8;

interface ErrorMessageProps {
    error: SetupError;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
    const output = error.output?.trim().split('\n').slice(-MAX_OUTPUT_LINES).join('\n');

    return (
        <Box flexDirection="column">
            <Text color="red">{error.message}</Text>
            {error.fix && <Text>→ {error.fix}</Text>}

            {output && (
                <Box marginTop={1} paddingLeft={2}>
                    <Text dimColor>{output}</Text>
                </Box>
            )}
        </Box>
    );
}
