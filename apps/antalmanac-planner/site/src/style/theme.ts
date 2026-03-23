import { createTheme, PaletteOptions } from '@mui/material';

const sharedTokens = {
  primary: {
    main: '#305db7',
  },
  misc: {
    midGray: '#8d8d8d',
  },
  chart: {
    blue: '#5babe1',
    red: '#e7966d',
    orange: '#ecad6d',
    yellow: '#f5d77f',
    green: '#87c587',
    pass: '#4ab486',
    noPass: '#e36436',
  },
  success: {
    main: 'green',
  },
};

const lightPalette: PaletteOptions = {
  mode: 'light',
  ...sharedTokens,
  secondary: {
    main: sharedTokens.primary.main,
  },
  overlay: {
    overlay1: '#fff',
    overlay2: '#f5f6fc',
    overlay3: '#fff',
  },
  background: {
    default: '#f5f6fc',
    paper: '#fff',
  },
  text: {
    primary: '#212529',
    secondary: '#606166',
  },
  reviews: {
    ...sharedTokens.chart,
  },
  error: {
    main: '#ce0000',
  },
};

const darkPalette: PaletteOptions = {
  mode: 'dark',
  ...sharedTokens,
  secondary: {
    main: '#90B3F9',
  },
  overlay: {
    overlay1: '#1e1e1e',
    overlay2: '#292929',
    overlay3: '#333',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#fff',
    secondary: '#99999f',
  },
  reviews: {
    blue: '#41779b',
    green: '#295629',
    red: '#b7523e',
    yellow: '#c49e3e',
    orange: '#c47e38',
  },
  error: {
    main: '#ff3333',
  },
};

export let theme = createTheme({
  cssVariables: { colorSchemeSelector: '[data-theme=%s]', nativeColor: true },
  colorSchemes: {
    light: { palette: lightPalette },
    dark: { palette: darkPalette },
  },
  shape: {
    borderRadius: 4,
    borderRadiusLg: 8,
  },
  spacing: 4,
});

const xsmall = {
  props: { size: 'xsmall' },
  style: {
    height: '24px',
    fontSize: '11px',
    '& .MuiButton-startIcon': {
      marginRight: 4,
    },
    '& .MuiButton-startIcon .MuiSvgIcon-root': {
      fontSize: '18px',
    },
    '& .MuiInputBase-input': {
      padding: '4px 10px 4px 10px',
      height: '24px',
      boxSizing: 'border-box',
      fontSize: 'inherit',
    },
    '& > div.MuiSelect-select.MuiInputBase-input': {
      paddingRight: '28px',
    },
    '& .MuiSvgIcon-root': {
      right: '2px',
    },
  },
};

theme = createTheme(theme, {
  components: {
    MuiBadge: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { variant: 'circular' },
              style: {
                '& .MuiBadge-badge': {
                  borderRadius: '50%',
                  width: 26,
                  height: 26,
                },
              },
            },
            {
              props: { color: 'pending' },
              style: {
                '& .MuiBadge-badge': {
                  backgroundColor: '#B8B8B8',
                  color: 'white',
                },
              },
            },
          ],
        },
      },
    },
    MuiButton: {
      variants: [xsmall],
      defaultProps: {
        variant: 'contained',
        disableElevation: true,
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          width: 32,
          height: 32,
          margin: -8,
          '&.Mui-checked': {
            '& > input': {
              margin: 0,
              top: 9,
              appearance: 'none',
              left: 9,
              width: 'calc(100% - 18px)',
              height: 'calc(100% - 18px)',
              background: 'white',
              zIndex: 0,
              borderRadius: 4,
              opacity: 1,
            },
            '& > svg': {
              zIndex: 1,
            },
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: 'inherit',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexDirection: 'column',
          marginBottom: theme.spacing(4),
          '&:last-child': {
            marginBottom: 0,
          },
          '& .MuiFormControlLabel-root': {
            display: 'flex',
            alignItems: 'center',
            paddingBlock: 2,
            margin: 0,
          },
          '& .MuiFormControlLabel-label': {
            marginLeft: 10,
            fontSize: 18,
          },
          'input[type="file"]': {
            fontSize: 16,
          },
          '> img': {
            width: '100%',
            height: 'auto',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: 'var(--mui-palette-text-secondary)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "[data-theme='dark'] &.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: 'var(--mui-palette-secondary-main)',
          },
          '&:hover:not(:focus-within) .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--mui-palette-text-secondary)',
          },
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        sizeLarge: {
          fontSize: 44,
        },
        iconEmpty: {
          color: 'var(--mui-palette-text-primary)',
        },
        iconFilled: {
          color: 'var(--mui-palette-secondary-main)',
        },
        iconHover: {
          opacity: 0.6,
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disablePortal: true,
          PaperProps: {
            style: { maxHeight: '25vh' },
          },
        },
      },
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            padding: '8px 10px',
          },
        },
      },
      variants: [xsmall],
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: 'var(--mui-palette-secondary-main)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: 'var(--mui-palette-secondary-main)',
        },
      },
    },
    MuiAutocomplete: {
      variants: [xsmall],
    },
  },
});
