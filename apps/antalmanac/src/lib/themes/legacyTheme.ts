import { History } from '@mui/icons-material';
import { amber, blue, deepOrange, deepPurple, green, pink, purple } from '@mui/material/colors';

import { type SectionColorThemeDefinition } from './types';

export const legacyTheme = {
    id: 'legacy',
    label: 'Legacy',
    description: 'Bold, saturated colors from the original AntAlmanac.',
    author: 'AntAlmanac',
    icon: History,
    palette: {
        blue: [blue[500], '#51b0f6', '#b1dcfb', '#042944', '#042944'],
        pink: [pink[500], '#ee4f88', '#f7abc7', '#f7abc7', '#f7abc7'],
        purple: [purple[500], '#bd36d3', '#d98ae5', '#070208', '#070208'],
        green: [green[500], '#6ebf71', '#b5deb6', '#b5deb6', '#b5deb6'],
        amber: [amber[500], '#ffd338', '#ffea9e', '#382c00', '#050400'],
        deepPurple: [deepPurple[500], '#8458ca', '#bda6e3', '#10091b', '#10091b'],
        deepOrange: [deepOrange[500], '#ff7f57', '#ffcdbd', '#571500', '#240900'],
    },
} satisfies SectionColorThemeDefinition;
