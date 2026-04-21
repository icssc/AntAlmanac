import { SectionThemeGrid } from '$components/SectionTheme/SectionThemeGrid';
import { getSectionThemeOptions } from '$lib/sectionThemes';
import { type SectionColorSetting } from '$lib/themes';
import { BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const sectionThemePickerDialogTestId = 'section-theme-picker-dialog';

export interface SectionThemePickerModalProps {
    open: boolean;
    onClose: () => void;
    sectionColor: SectionColorSetting;
    onApply: (setting: SectionColorSetting) => void;
    title?: string;
    description?: React.ReactNode;
}

function initialPending(sectionColor: SectionColorSetting): SectionColorSetting {
    return sectionColor;
}

export function SectionThemePickerModal({
    open,
    onClose,
    sectionColor,
    onApply,
    title = 'Section Themes',
    description,
}: SectionThemePickerModalProps) {
    const isDark = useThemeStore((s) => s.isDark);
    const options = useMemo(() => getSectionThemeOptions(isDark), [isDark]);

    const [pending, setPending] = useState<SectionColorSetting>(() => initialPending(sectionColor));

    useEffect(() => {
        if (open) {
            setPending(initialPending(sectionColor));
        }
    }, [open, sectionColor]);

    const handleApply = useCallback(() => {
        onApply(pending);
        onClose();
    }, [onApply, onClose, pending]);

    const applyThemeLabel = pending === 'custom' ? 'Custom' : (options.find((o) => o.value === pending)?.label ?? '');

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            open={open}
            onClose={onClose}
            data-testid={sectionThemePickerDialogTestId}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '12px',
                        maxHeight: 'min(88vh, 820px)',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                    },
                },
            }}
        >
            <DialogTitle sx={{ pb: description ? 0.75 : 1.25, flexShrink: 0, pt: 2.5, px: 3 }}>
                <Typography
                    component="h2"
                    variant="h5"
                    fontWeight={700}
                    sx={{ lineHeight: 1.3, letterSpacing: '-0.02em' }}
                >
                    {title}
                </Typography>
            </DialogTitle>

            {description ? (
                <DialogContent sx={{ pt: 0, pb: 1.5, flexShrink: 0, px: 3 }}>
                    {typeof description === 'string' ? (
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.55, fontSize: '1rem' }}>
                            {description}
                        </Typography>
                    ) : (
                        description
                    )}
                </DialogContent>
            ) : null}

            <DialogContent
                sx={{
                    pt: description ? 0 : 1,
                    overflow: 'auto',
                    flex: '1 1 auto',
                    minHeight: 0,
                    px: { xs: 2, sm: 3 },
                }}
            >
                <SectionThemeGrid
                    options={options}
                    selectedValue={pending}
                    isDark={isDark}
                    compact={false}
                    onSelect={setPending}
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexShrink: 0 }}>
                <Button onClick={onClose} variant="text" color="inherit" sx={{ color: 'text.secondary' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleApply}
                    variant="contained"
                    sx={{
                        backgroundColor: BLUE,
                        '&:hover': { backgroundColor: '#254ca0' },
                        borderRadius: '6px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                    }}
                >
                    Apply {applyThemeLabel} Theme
                </Button>
            </DialogActions>
        </Dialog>
    );
}
