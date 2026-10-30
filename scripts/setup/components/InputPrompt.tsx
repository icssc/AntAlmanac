import { PasswordInput } from '@inkjs/ui';
import { Box, Text } from 'ink';

interface InputPromptProps {
    message: string;
    onSubmit: (value: string) => void;
}

export function InputPrompt({ message, onSubmit }: InputPromptProps) {
    return (
        <Box gap={1}>
            <Text bold>{message}</Text>
            <PasswordInput placeholder="or press Enter to quit" onSubmit={onSubmit} />
        </Box>
    );
}
