import { Box, Text } from 'ink';

const DEV_COMMANDS = [
    { command: 'pnpm dev', description: 'Start the development server' },
    { command: 'pnpm db:start', description: 'Start the database' },
    { command: 'pnpm db:stop', description: 'Stop the database' },
];

interface SummaryProps {
    hasSkipped: boolean;
}

export function Summary({ hasSkipped }: SummaryProps) {
    const color = hasSkipped ? 'yellow' : 'green';

    return (
        <Box flexDirection="column" alignSelf="flex-start" borderStyle="round" borderColor={color} paddingX={1} gap={1}>
            {hasSkipped ? (
                <Text bold>Almost there. Run this command again to finish the skipped steps.</Text>
            ) : (
                <Text bold color={color}>
                    ✓ You’re all set. Let’s build.
                </Text>
            )}

            <Box flexDirection="column">
                {DEV_COMMANDS.map(({ command, description }) => (
                    <Box key={command} gap={2}>
                        <Box width={14}>
                            <Text color="cyan">{command}</Text>
                        </Box>
                        <Text dimColor>{description}</Text>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
