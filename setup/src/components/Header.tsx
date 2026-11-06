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
 * The logo is drawn in the terminal's default text color so it stays readable on both light and dark themes.
 */
export function Header() {
    const { stdout } = useStdout();
    const logo = stdout.columns >= 100 ? LOGO : LOGO_SMALL;

    return (
        <Box flexDirection="column" gap={1}>
            <Box flexDirection="column">
                {logo.map((line) => (
                    <Text key={line}>{line}</Text>
                ))}
            </Box>

            <Text>Made with 🩷 by ICSSC Projects</Text>
        </Box>
    );
}
