import { Pets } from '@mui/icons-material';

import { type SectionColorThemeDefinition } from './types';

export const catppuccinTheme = {
    id: 'catppuccin',
    label: 'Catppuccin',
    description: 'Pastel accents from the Catppuccin palette. Latte in light UI and Mocha in Dark Mode.',
    author: 'Catppuccin',
    icon: Pets,
    palette: {
        rosewater: ['#f2e8e5', '#eccfd0', '#e8b6d4', '#d6b4fa', '#e0969a'],
        flamingo: ['#eccfd0', '#e8b6d4', '#d6b4fa', '#8aadf9', '#7cc4e0'],
        mauve: ['#d6b4fa', '#8aadf9', '#7cc4e0', '#99d7e7', '#b0d48c'],
        sapphire: ['#7cc4e0', '#99d7e7', '#b0d48c', '#e0c38a', '#f2b49a'],
        lavender: ['#d6dcfa', '#d0d8fc', '#dce4fa', '#f2e8e5', '#eccfd0'],
        maroon: ['#eba8b5', '#e0969a', '#f2b49a', '#e0c38a', '#b0d48c'],
        teal: ['#b0d48c', '#9fd4c8', '#7cc4e0', '#8aadf9', '#d6b4fa'],
    },
    paletteDark: {
        rosewater: ['#f5e0dc', '#f2cdcd', '#f5c2e7', '#cba6f7', '#94e2d5'],
        flamingo: ['#f2cdcd', '#f5c2e7', '#cba6f7', '#89b4fa', '#74c7ec'],
        mauve: ['#cba6f7', '#89b4fa', '#74c7ec', '#94e2d5', '#a6e3a1'],
        sapphire: ['#74c7ec', '#89dceb', '#94e2d5', '#a6e3a1', '#f9e2af'],
        lavender: ['#b4befe', '#c6d0f5', '#d0d8f5', '#e1e8f5', '#f5e0dc'],
        maroon: ['#eba0ac', '#f38ba8', '#fab387', '#f9e2af', '#a6e3a1'],
        teal: ['#94e2d5', '#89dceb', '#74c7ec', '#89b4fa', '#cba6f7'],
    },
} satisfies SectionColorThemeDefinition;
