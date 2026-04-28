import { Palette } from '@mui/icons-material';
import { amber, blue, deepOrange, deepPurple, green, pink, purple } from '@mui/material/colors';

import { type SectionColorThemeDefinition } from './types';

export const defaultTheme = {
    id: 'default',
    label: 'Default',
    description: 'Soft Material Design pastels - easy on the eyes for long planning sessions.',
    author: 'AntAlmanac',
    icon: Palette,
    palette: {
        blue: [blue[300], blue[200], blue[100], blue[400], blue[500]],
        pink: [pink[300], pink[200], pink[100], pink[400], pink[500]],
        purple: [purple[300], purple[200], purple[100], purple[400], purple[500]],
        green: [green[300], green[200], green[100], green[400], green[500]],
        amber: [amber[300], amber[200], amber[100], amber[400], amber[500]],
        deepPurple: [deepPurple[300], deepPurple[200], deepPurple[100], deepPurple[400], deepPurple[500]],
        deepOrange: [deepOrange[300], deepOrange[200], deepOrange[100], deepOrange[400], deepOrange[500]],
    },
} satisfies SectionColorThemeDefinition;
