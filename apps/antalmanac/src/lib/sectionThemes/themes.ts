import { amber, blue, deepOrange, deepPurple, green, pink, purple } from '@mui/material/colors';

/**
 * Theme palettes for the calendar. Each theme is a list of "color families",
 * and each family is an ordered list of variants where index 0 is the primary color.
 *
 * - Variant 0 is used for the first section of a course.
 * - Variants 1+ are used for additional section types within the same course.
 *
 * Themes are intentionally stored as plain data: no icons, descriptions, or other
 * presentational metadata, so this file is the only place to edit when adding /
 * removing colors.
 */

const defaultPalette = [
    [blue[300], blue[200], blue[100], blue[400], blue[500]],
    [pink[300], pink[200], pink[100], pink[400], pink[500]],
    [purple[300], purple[200], purple[100], purple[400], purple[500]],
    [green[300], green[200], green[100], green[400], green[500]],
    [amber[300], amber[200], amber[100], amber[400], amber[500]],
    [deepPurple[300], deepPurple[200], deepPurple[100], deepPurple[400], deepPurple[500]],
    [deepOrange[300], deepOrange[200], deepOrange[100], deepOrange[400], deepOrange[500]],
];

const legacyPalette = [
    [blue[500], '#51b0f6', '#b1dcfb', '#042944', '#042944'],
    [pink[500], '#ee4f88', '#f7abc7', '#f7abc7', '#f7abc7'],
    [purple[500], '#bd36d3', '#d98ae5', '#070208', '#070208'],
    [green[500], '#6ebf71', '#b5deb6', '#b5deb6', '#b5deb6'],
    [amber[500], '#ffd338', '#ffea9e', '#382c00', '#050400'],
    [deepPurple[500], '#8458ca', '#bda6e3', '#10091b', '#10091b'],
    [deepOrange[500], '#ff7f57', '#ffcdbd', '#571500', '#240900'],
];

const pastelPalette = [
    [blue[200], blue[100], blue[300], blue[400]],
    [pink[200], pink[100], pink[300], pink[400]],
    [purple[200], purple[100], purple[300], purple[400]],
    [green[200], green[100], green[300], green[400]],
    [amber[200], amber[100], amber[300], amber[400]],
    [deepPurple[200], deepPurple[100], deepPurple[300], deepPurple[400]],
    [deepOrange[200], deepOrange[100], deepOrange[300], deepOrange[400]],
];

const catppuccinLatte = [
    ['#f2e8e5', '#eccfd0', '#e8b6d4', '#d6b4fa', '#e0969a'],
    ['#eccfd0', '#e8b6d4', '#d6b4fa', '#8aadf9', '#7cc4e0'],
    ['#d6b4fa', '#8aadf9', '#7cc4e0', '#99d7e7', '#b0d48c'],
    ['#7cc4e0', '#99d7e7', '#b0d48c', '#e0c38a', '#f2b49a'],
    ['#d6dcfa', '#d0d8fc', '#dce4fa', '#f2e8e5', '#eccfd0'],
    ['#eba8b5', '#e0969a', '#f2b49a', '#e0c38a', '#b0d48c'],
    ['#b0d48c', '#9fd4c8', '#7cc4e0', '#8aadf9', '#d6b4fa'],
];

const catppuccinMocha = [
    ['#f5e0dc', '#f2cdcd', '#f5c2e7', '#cba6f7', '#94e2d5'],
    ['#f2cdcd', '#f5c2e7', '#cba6f7', '#89b4fa', '#74c7ec'],
    ['#cba6f7', '#89b4fa', '#74c7ec', '#94e2d5', '#a6e3a1'],
    ['#74c7ec', '#89dceb', '#94e2d5', '#a6e3a1', '#f9e2af'],
    ['#b4befe', '#c6d0f5', '#d0d8f5', '#e1e8f5', '#f5e0dc'],
    ['#eba0ac', '#f38ba8', '#fab387', '#f9e2af', '#a6e3a1'],
    ['#94e2d5', '#89dceb', '#74c7ec', '#89b4fa', '#cba6f7'],
];

const quietLuxuryPalette = [
    ['#F7E6CA', '#F2DFC0', '#EDD8B6', '#E8D1AC', '#E3CAA2'],
    ['#E8D59E', '#E3CE94', '#DEC78A', '#D9C080', '#D4B976'],
    ['#D9BBB0', '#D4B3A8', '#CFABA0', '#CAA398', '#C59B90'],
    ['#AD9C8E', '#A89488', '#A38C82', '#9E847C', '#997C76'],
    ['#EDE3D7', '#E8D9CD', '#E3CFC3', '#DEC5B9', '#D9BBAF'],
    ['#C4B5A4', '#BFADA2', '#BAA59C', '#B59D96', '#B09590'],
    ['#8E8074', '#89786E', '#847068', '#7F6862', '#7A605C'],
];

export type SectionThemeId = 'default' | 'legacy' | 'pastel' | 'catppuccin' | 'quietLuxury';

export interface SectionTheme {
    readonly id: SectionThemeId;
    readonly name: string;
    readonly light: readonly (readonly string[])[];
    readonly dark?: readonly (readonly string[])[];
}

export const SECTION_THEMES: readonly SectionTheme[] = [
    { id: 'default', name: 'Default', light: defaultPalette },
    { id: 'legacy', name: 'Legacy', light: legacyPalette },
    { id: 'pastel', name: 'Pastel', light: pastelPalette },
    { id: 'catppuccin', name: 'Catppuccin', light: catppuccinLatte, dark: catppuccinMocha },
    { id: 'quietLuxury', name: 'Quiet Luxury', light: quietLuxuryPalette },
];
