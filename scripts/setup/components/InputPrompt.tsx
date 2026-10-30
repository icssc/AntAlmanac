import { PasswordInput } from '@inkjs/ui';
import { Box, Text } from 'ink';

interface InputPromptProps {
    message: string;
    note: string;
    onSubmit: (value: string) => void;
}

export function InputPrompt({ message, note, onSubmit }: InputPromptProps) {
    return (
        <Box flexDirection="column">
            <Text bold>{message}</Text>

            <Box gap={1}>
                <Text color="cyan">›</Text>
                <PasswordInput placeholder="or press Enter to quit" onSubmit={onSubmit} />
            </Box>

            <Text dimColor>{note}</Text>
        </Box>
    );
}
