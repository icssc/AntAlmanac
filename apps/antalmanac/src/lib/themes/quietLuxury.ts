import { Diamond } from '@mui/icons-material';

import { type SectionColorThemeDefinition } from './types';

export const quietLuxuryTheme = {
    id: 'quiet_luxury',
    label: 'Quiet Luxury',
    description: 'Warm cream and stone neutrals with a refined, understated feel.',
    author: 'Kayleb Wan',
    icon: Diamond,
    palette: {
        cream: ['#F7E6CA', '#F2DFC0', '#EDD8B6', '#E8D1AC', '#E3CAA2'],
        gold: ['#E8D59E', '#E3CE94', '#DEC78A', '#D9C080', '#D4B976'],
        blush: ['#D9BBB0', '#D4B3A8', '#CFABA0', '#CAA398', '#C59B90'],
        taupe: ['#AD9C8E', '#A89488', '#A38C82', '#9E847C', '#997C76'],
        champagne: ['#EDE3D7', '#E8D9CD', '#E3CFC3', '#DEC5B9', '#D9BBAF'],
        sand: ['#C4B5A4', '#BFADA2', '#BAA59C', '#B59D96', '#B09590'],
        stone: ['#8E8074', '#89786E', '#847068', '#7F6862', '#7A605C'],
    },
} satisfies SectionColorThemeDefinition;
