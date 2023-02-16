import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';

/**
 * provide MUIv4 theme to the app
 */
export default function Mui4ThemeProvider(props: { children: React.ReactNode }) {
    const theme = createTheme({
        typography: {
            htmlFontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10),
            fontSize: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10) * 0.9,
        },
        palette: {
            type: 'dark',
            primary: {
                light: '#5191d6',
                main: '#0064a4',
                dark: '#003a75',
                contrastText: '#fff',
            },
            secondary: {
                light: '#ffff52',
                main: '#ffd200',
                dark: '#c7a100',
                contrastText: '#000',
            },
        },
        spacing: 4,
    });

    return <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>
}
