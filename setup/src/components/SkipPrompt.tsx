import { Select } from '@inkjs/ui';
import { Box, Text } from 'ink';

interface SkipPromptProps {
    label: string;
    onRetry: () => void;
    onSkip: () => void;
    onQuit: () => void;
}

export function SkipPrompt({ label, onRetry, onSkip, onQuit }: SkipPromptProps) {
    const options = [
        { label: 'Try again', value: 'retry' },
        { label: `Continue without ${label}`, value: 'skip' },
        { label: 'Quit', value: 'quit' },
    ];

    function handleChange(value: string) {
        if (value === 'retry') {
            onRetry();
        } else if (value === 'skip') {
            onSkip();
        } else {
            onQuit();
        }
    }

    return (
        <Box flexDirection="column">
            <Text bold>What would you like to do?</Text>
            <Select options={options} onChange={handleChange} />
        </Box>
    );
}
