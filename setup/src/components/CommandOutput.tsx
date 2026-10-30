import { stripVTControlCharacters } from 'node:util';

import { commandEvents } from '$src/helpers';
import { Box, Text } from 'ink';
import { useEffect, useState } from 'react';

const MAX_LINES = 6;

/**
 * Shows the command the current step is running and the last few lines it printed.
 */
export function CommandOutput() {
    const [command, setCommand] = useState<string>();
    const [lines, setLines] = useState<string[]>([]);

    useEffect(() => {
        function handleCommand(command: string) {
            setCommand(command);
            setLines([]);
        }

        function handleOutput(output: string) {
            const newLines = stripVTControlCharacters(output)
                .split(/\r?\n|\r/)
                .filter((line) => line.trim());

            setLines((previous) => [...previous, ...newLines].slice(-MAX_LINES));
        }

        commandEvents.on('command', handleCommand);
        commandEvents.on('output', handleOutput);

        return () => {
            commandEvents.off('command', handleCommand);
            commandEvents.off('output', handleOutput);
        };
    }, []);

    if (!command) {
        return null;
    }

    return (
        <Box flexDirection="column" borderStyle="round" borderDimColor paddingX={1}>
            <Text color="cyan">$ {command}</Text>

            {lines.map((line, index) => (
                <Text key={index} dimColor wrap="truncate">
                    {line}
                </Text>
            ))}
        </Box>
    );
}
