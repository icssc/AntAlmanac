import type { SvgIconComponent } from '@mui/icons-material';

export interface SectionColorThemeDefinition {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly author: string;
    readonly icon: SvgIconComponent;
    readonly palette: Record<string, string[]>;
    readonly paletteDark?: Record<string, string[]>;
}
