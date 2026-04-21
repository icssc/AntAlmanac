import { Gradient } from '@mui/icons-material';
import { amber, blue, deepOrange, deepPurple, green, pink, purple } from '@mui/material/colors';

import { type SectionColorThemeDefinition } from './types';

export const pastelTheme = {
    id: 'pastel',
    label: 'Pastel',
    description: 'Light Material pastels with four tints per family for a soft, airy schedule.',
    author: 'Vikkee Xang and Alejandro Mirror',
    icon: Gradient,
    palette: {
        blue: [blue[200], blue[100], blue[300], blue[400]],
        pink: [pink[200], pink[100], pink[300], pink[400]],
        purple: [purple[200], purple[100], purple[300], purple[400]],
        green: [green[200], green[100], green[300], green[400]],
        amber: [amber[200], amber[100], amber[300], amber[400]],
        deepPurple: [deepPurple[200], deepPurple[100], deepPurple[300], deepPurple[400]],
        deepOrange: [deepOrange[200], deepOrange[100], deepOrange[300], deepOrange[400]],
    },
} satisfies SectionColorThemeDefinition;
