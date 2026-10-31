import { Select } from '@inkjs/ui';
import { Box, Text } from 'ink';

const OPTIONS = [
    { label: 'Set up AntAlmanac for development', value: 'confirm' },
    { label: 'Cancel', value: 'cancel' },
];

interface ConfirmPromptProps {
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmPrompt({ onConfirm, onCancel }: ConfirmPromptProps) {
    function handleChange(value: string) {
        if (value === 'confirm') {
            onConfirm();
        } else {
            onCancel();
        }
    }

    return (
        <Box flexDirection="column" gap={1}>
            <Text dimColor>Steps that are already done are only verified, so it is safe to run this again.</Text>
            <Select options={OPTIONS} onChange={handleChange} />
        </Box>
    );
}
