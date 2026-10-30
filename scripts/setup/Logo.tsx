import { Box, Text, useStdout } from 'ink';

const LOGO = [
    '      ⢀⣠⣴⣾⣿⣿⣷⣤⡴⣢⣶⣶⣽⢿⣶⣶⣶⣤⣤⣤⣤⣤⣤⣄',
    '    ⢠⣶⣿⣿⣿⣿⣿⣿⣿⣷⣧⣿⣿⣿⡿⣹⣿⣿⣿⣿⣿⣿⣿⠿⠛⠋   ⢀                                                  ⡀    ⢀⡀',
    '  ⢰⣿⣶⣾⣯⣭⣽⢿⣿⣿⣿⣿⣿⣿⣷⣶⣿⣿⣿⣿⠿⠛⠉⠁      ⢀⡾⣆  ⢸⣷⣄ ⢸⡇⠈⠉⣿⡏⠉    ⢠⣿⡄  ⣿    ⣿⣄  ⣠⣾  ⢠⡿⣆  ⣿⣦⣄ ⢸⡇  ⣼⣷⡀ ⣴⠟⠋⠉⠋',
    '⢀⡾⠿⢿⣶⣾⣿⣽⢿⣾⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠋          ⢀⡾⠥⢽⣆ ⢸⡇⠙⠳⣼⡇  ⣿⡇    ⢠⡿⠤⢿⡄ ⣿    ⣿⠙⢷⡼⠋⣿ ⢀⡾⠥⢿⣆ ⣿⡇⠙⢷⣼⡇ ⣼⠧⠼⣷⡀⢿⡄',
    '⠿⠿⢿⣿⣷⣶⣾⢟⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋             ⠚⠁  ⠙⠂⠘⠃  ⠈⠃  ⠛⠁    ⠛  ⠈⠛ ⠛⠛⠛⠛ ⠛    ⠛ ⠚⠁  ⠛ ⠙⠁  ⠈⠃⠘⠋  ⠘⠃ ⠙⠛⠛⠋',
    '     ⠈⠙⠿⠿⠛⠈⠻⣿⣿⠟⠁',
];

const LOGO_SMALL = [
    '     ⣠⣴⣶⣿⣿⣷⣶⣢⣶⣶⣝⣿⣶⣶⣶⣤⣤⣶⣶⡄',
    '  ⣀⣰⡾⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣫⣿⣿⣿⣿⡿⠿⠛⠉⠁  ⢠⡀  ⣄  ⢠ ⣤⣤⣤⡄   ⢀⡄  ⣤   ⣀   ⢀  ⢀⡄  ⣄  ⢠⡄  ⣄  ⢀⣠⣤⣄',
    ' ⣤⣿⣟⣻⣿⣿⣟⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠋⠁      ⢠⣟⣷⡀ ⡟⠳⣄⢸  ⢸    ⢀⣾⣻⡄ ⣿   ⣿⢷⣀⣴⢻ ⢀⣾⣻⡄ ⣿⠳⣤⣸⡇ ⣼⣻⣆ ⣟',
    '⣶⣾⣿⣭⣽⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁         ⠠⠟⠉⠉⠷ ⠇ ⠈⠻  ⠸    ⠾⠉⠉⠻⠄⠿⠶⠶⠄⠻ ⠙⠁⠸ ⠾⠉⠉⠻⠄⠿ ⠈⠙⠇⠸⠋⠉⠹⠆⠙⠶⠴⠶',
    '   ⠉⠉⠻⠯⠟⠉⢿⣿⡿⠋',
];

/**
 * Drawn in the terminal's default text color so it stays readable on both light and dark themes.
 */
export function Logo() {
    const { stdout } = useStdout();
    const logo = stdout.columns >= 100 ? LOGO : LOGO_SMALL;

    return (
        <Box flexDirection="column">
            {logo.map((line) => (
                <Text key={line}>{line}</Text>
            ))}
        </Box>
    );
}
