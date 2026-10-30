import { ConfirmInput } from '@inkjs/ui';
import { Box, Text } from 'ink';

interface ConfirmPromptProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmPrompt({ onConfirm, onCancel }: ConfirmPromptProps) {
    return (
        <Box flexDirection="column">
            <Box gap={1}>
                <Text bold>Set up AntAlmanac for development?</Text>
                <ConfirmInput onConfirm={onConfirm} onCancel={onCancel} />
            </Box>

            <Text dimColor>Steps that are already done are only verified, so it is safe to run this again.</Text>
        </Box>
    );
}
