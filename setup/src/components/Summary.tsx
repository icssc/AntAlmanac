import { Box, Text } from 'ink';

const DEV_COMMANDS = [
    { command: 'pnpm dev', description: 'Start the development server' },
    { command: 'pnpm db:start', description: 'Start the database' },
    { command: 'pnpm db:stop', description: 'Stop the database' },
    { command: 'pnpm get-data', description: 'Download the latest course data' },
];

interface SummaryProps {
    skippedLabels: string[];
}

export function Summary({ skippedLabels }: SummaryProps) {
    const isPartial = skippedLabels.length > 0;
    const color = isPartial ? 'yellow' : 'green';

    return (
        <Box flexDirection="column" alignSelf="flex-start" borderStyle="round" borderColor={color} paddingX={1} gap={1}>
            {isPartial ? (
                <Box flexDirection="column">
                    <Text bold>Partially set up without {skippedLabels.join(' or ')}.</Text>
                    <Text>Start {skippedLabels.join(' and ')}, then run this command again to finish setting up.</Text>
                </Box>
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
