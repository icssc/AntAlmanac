import { colorContrastSufficient } from '$lib/calendarEventTextColor';
import { type SectionThemeOption, type SectionThemePreset } from '$lib/sectionThemes';
import { BLUE } from '$src/globals';
import { Check, Colorize } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

function Swatch({ color }: { color: string }) {
    return (
        <Box
            sx={{
                width: 18,
                height: 18,
                borderRadius: '3px',
                backgroundColor: color,
                flexShrink: 0,
            }}
        />
    );
}

function PreviewEventRow({ label, color }: { label: string; color: string }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                borderRadius: '4px',
                padding: '4px 6px',
                backgroundColor: color,
                fontSize: '0.65rem',
                fontWeight: 600,
                color: colorContrastSufficient(color) ? 'white' : 'black',
                letterSpacing: 0.2,
                userSelect: 'none',
            }}
        >
            {label}
        </Box>
    );
}

export type SectionThemeGridSelection = SectionThemePreset | 'custom';

interface CustomThemeCardProps {
    isSelected: boolean;
    isDark: boolean;
    compact?: boolean;
    onSelect: () => void;
}

function CustomThemeCard({ isSelected, isDark, compact, onSelect }: CustomThemeCardProps) {
    const pad = compact ? '12px' : '14px';

    return (
        <Box
            onClick={onSelect}
            role="button"
            aria-pressed={isSelected}
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: compact ? 0.75 : 1,
                padding: pad,
                borderRadius: '8px',
                cursor: 'pointer',
                border: `2px solid ${isSelected ? BLUE : isDark ? '#555' : '#d3d4d5'}`,
                backgroundColor: isSelected ? (isDark ? '#1a2740' : '#eef3fc') : isDark ? '#2a2a2a' : '#fafafa',
                transition: 'border-color 0.15s, background-color 0.15s',
                '&:hover': {
                    borderColor: isSelected ? BLUE : isDark ? '#888' : '#aaa',
                    backgroundColor: isSelected ? (isDark ? '#1a2740' : '#eef3fc') : isDark ? '#333' : '#f0f0f0',
                },
            }}
        >
            {isSelected && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: compact ? 6 : 8,
                        right: compact ? 6 : 8,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: BLUE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Check sx={{ fontSize: 14, color: '#fff' }} />
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 3.5 }}>
                <Box
                    sx={{
                        color: isSelected ? BLUE : 'text.secondary',
                        display: 'inline-flex',
                        flexShrink: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 0,
                        '& .MuiSvgIcon-root': { fontSize: compact ? 22 : 24, display: 'block' },
                    }}
                >
                    <Colorize />
                </Box>
                <Typography
                    component="h3"
                    variant="subtitle1"
                    sx={{
                        m: 0,
                        fontSize: compact ? '1rem' : '1.0625rem',
                        fontWeight: isSelected ? 700 : 600,
                        color: isSelected ? BLUE : 'text.primary',
                        lineHeight: 1.35,
                        letterSpacing: '-0.01em',
                    }}
                >
                    Custom
                </Typography>
            </Box>

            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    lineHeight: 1.55,
                    fontSize: compact ? '0.875rem' : '0.9375rem',
                }}
            >
                Set a section's color using the color picker by clicking on each course on the calendar.
            </Typography>
        </Box>
    );
}

interface ThemeCardProps {
    option: SectionThemeOption;
    isSelected: boolean;
    isDark: boolean;
    compact?: boolean;
    onSelect: (value: SectionThemePreset) => void;
}

function ThemeCard({ option, isSelected, isDark, compact, onSelect }: ThemeCardProps) {
    const pad = compact ? '12px' : '14px';

    return (
        <Box
            onClick={() => onSelect(option.value)}
            role="button"
            aria-pressed={isSelected}
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: compact ? 0.75 : 1,
                padding: pad,
                borderRadius: '8px',
                cursor: 'pointer',
                border: `2px solid ${isSelected ? BLUE : isDark ? '#555' : '#d3d4d5'}`,
                backgroundColor: isSelected ? (isDark ? '#1a2740' : '#eef3fc') : isDark ? '#2a2a2a' : '#fafafa',
                transition: 'border-color 0.15s, background-color 0.15s',
                '&:hover': {
                    borderColor: isSelected ? BLUE : isDark ? '#888' : '#aaa',
                    backgroundColor: isSelected ? (isDark ? '#1a2740' : '#eef3fc') : isDark ? '#333' : '#f0f0f0',
                },
            }}
        >
            {isSelected && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: compact ? 6 : 8,
                        right: compact ? 6 : 8,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: BLUE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Check sx={{ fontSize: 14, color: '#fff' }} />
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 3.5 }}>
                <Box
                    sx={{
                        color: isSelected ? BLUE : 'text.secondary',
                        display: 'inline-flex',
                        flexShrink: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 0,
                        '& .MuiSvgIcon-root': { fontSize: compact ? 22 : 24, display: 'block' },
                    }}
                >
                    {option.icon}
                </Box>
                <Typography
                    component="h3"
                    variant="subtitle1"
                    sx={{
                        m: 0,
                        fontSize: compact ? '1rem' : '1.0625rem',
                        fontWeight: isSelected ? 700 : 600,
                        color: isSelected ? BLUE : 'text.primary',
                        lineHeight: 1.35,
                        letterSpacing: '-0.01em',
                    }}
                >
                    {option.label}
                </Typography>
            </Box>

            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    lineHeight: 1.55,
                    fontSize: compact ? '0.875rem' : '0.9375rem',
                }}
            >
                {option.description}
            </Typography>

            <Box sx={{ mt: 0.25 }}>
                <Typography
                    component="div"
                    variant="overline"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        fontSize: '0.75rem',
                        lineHeight: 1.3,
                        display: 'block',
                    }}
                >
                    Author
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.primary',
                        fontWeight: 500,
                        mt: 0.5,
                        lineHeight: 1.45,
                        fontSize: '0.9375rem',
                    }}
                >
                    {option.author}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {option.swatches.map((color, i) => (
                    <Swatch key={i} color={color} />
                ))}
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    padding: compact ? '4px' : '6px',
                    borderRadius: '4px',
                    backgroundColor: isDark ? '#1e1e1e' : '#fff',
                    border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
                }}
            >
                {option.previewRows.map((row, i) => (
                    <PreviewEventRow key={i} label={row.label} color={row.color} />
                ))}
            </Box>
        </Box>
    );
}

export interface SectionThemeGridProps {
    options: SectionThemeOption[];
    selectedValue: SectionThemeGridSelection;
    isDark: boolean;
    onSelect: (value: SectionThemeGridSelection) => void;
    compact?: boolean;
    /** When true, a full-width &quot;Custom&quot; option appears above the preset themes. */
    showCustomOption?: boolean;
}

export function SectionThemeGrid({
    options,
    selectedValue,
    isDark,
    onSelect,
    compact,
    showCustomOption = true,
}: SectionThemeGridProps) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: compact ? 1.25 : 1.5,
                alignItems: 'stretch',
            }}
        >
            {showCustomOption ? (
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                    <CustomThemeCard
                        isSelected={selectedValue === 'custom'}
                        isDark={isDark}
                        compact={compact}
                        onSelect={() => onSelect('custom')}
                    />
                </Box>
            ) : null}
            {options.map((option) => (
                <ThemeCard
                    key={option.value}
                    option={option}
                    isSelected={selectedValue === option.value}
                    isDark={isDark}
                    compact={compact}
                    onSelect={onSelect}
                />
            ))}
        </Box>
    );
}
