import { PasswordInput, Select } from '@inkjs/ui';
import { Box, Text } from 'ink';
import open from 'open';
import { useState } from 'react';

interface InputPromptProps {
    message: string;
    note: string;
    url?: string;
    onSubmit: (value: string) => void;
    onQuit: () => void;
}

export function InputPrompt({ message, note, url, onSubmit, onQuit }: InputPromptProps) {
    const [isTyping, setIsTyping] = useState(!url);
    const [notice, setNotice] = useState<string>();

    const options = [
        { label: 'Open the dashboard in my browser', value: 'open' },
        { label: 'Paste a key I already have', value: 'paste' },
        { label: 'Quit', value: 'quit' },
    ];

    async function handleChange(value: string) {
        if (value === 'quit') {
            onQuit();
            return;
        }

        if (value === 'open' && url) {
            try {
                await open(url);
                setNotice('Opened the dashboard in your browser. Create a key there, then paste it here.');
            } catch {
                setNotice(`Could not open a browser. Visit ${url} instead.`);
            }
        }

        setIsTyping(true);
    }

    function handleSubmit(value: string) {
        if (value.trim()) {
            onSubmit(value.trim());
        } else {
            onQuit();
        }
    }

    if (!isTyping) {
        return (
            <Box flexDirection="column" gap={1}>
                <Box flexDirection="column">
                    <Text bold>Do you have a key?</Text>
                    <Select options={options} onChange={handleChange} />
                </Box>

                <Text dimColor>↑/↓ to choose · Enter to confirm · Ctrl+C to quit</Text>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" gap={1}>
            {notice && <Text color="cyan">{notice}</Text>}

            <Box flexDirection="column">
                <Text bold>{message}</Text>

                <Box gap={1}>
                    <Text color="cyan">›</Text>
                    <PasswordInput placeholder="or press Enter to quit" onSubmit={handleSubmit} />
                </Box>

                <Text dimColor>{note}</Text>
            </Box>

            <Text dimColor>Input is hidden · Enter to submit · Ctrl+C to quit</Text>
        </Box>
    );
}
