'use client';

import { Close, Keyboard } from '@mui/icons-material';
import { Box, Dialog, IconButton, Stack, Typography, useMediaQuery, useTheme, alpha } from '@mui/material';
import { useCallback, useEffect } from 'react';

import {
    KEYBOARD_SHORTCUT_SECTIONS,
    formatShortcutKeys,
    isMacPlatform,
    type ShortcutKey,
} from '$lib/keyboardShortcuts';
import { BLUE } from '$src/globals';

/** Single neutral kbd look — reads in light/dark without loud colors */
function Kbd({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            component="kbd"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 22,
                minWidth: 22,
                px: 0.65,
                py: 0.2,
                borderRadius: 1,
                fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
                fontSize: '0.6875rem',
                fontWeight: 600,
                lineHeight: 1.2,
                color: 'text.primary',
                bgcolor: isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.06),
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            {children}
        </Box>
    );
}

function KeyCombo({ keys }: { keys: ShortcutKey[] }) {
    const mac = isMacPlatform();
    const parts = formatShortcutKeys(keys, mac);

    return (
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.35} useFlexGap>
            {parts.map((part, i) => (
                <Stack key={i} direction="row" alignItems="center" gap={0.35}>
                    {i > 0 && (
                        <Typography
                            component="span"
                            sx={{ fontSize: '0.65rem', color: 'text.disabled', fontWeight: 600 }}
                        >
                            +
                        </Typography>
                    )}
                    <Kbd>{part}</Kbd>
                </Stack>
            ))}
        </Stack>
    );
}

function ShortcutRow({ description, keys, isLast }: { description: string; keys: ShortcutKey[]; isLast: boolean }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 0.5, sm: 1 },
                py: { xs: 0.65, sm: 0.5 },
                borderBottom: isLast ? 'none' : '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography
                sx={{
                    fontSize: { xs: '0.8125rem', sm: '0.8rem' },
                    lineHeight: 1.35,
                    color: 'text.primary',
                    flex: 1,
                    minWidth: 0,
                    pr: { sm: 1 },
                }}
            >
                {description}
            </Typography>
            <Box
                sx={{
                    flexShrink: 0,
                    alignSelf: { xs: 'stretch', sm: 'center' },
                    display: 'flex',
                    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                }}
            >
                <KeyCombo keys={keys} />
            </Box>
        </Box>
    );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Box sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
            <Typography
                sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    mb: 0.5,
                    pb: 0.4,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {title}
            </Typography>
            <Box>{children}</Box>
        </Box>
    );
}

export interface KeyboardShortcutsModalProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Compact shortcuts list; neutral keys; full-screen on small viewports + safe areas.
 */
export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDark = theme.palette.mode === 'dark';
    const mac = isMacPlatform();

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (!open) return;
        document.body.setAttribute('data-shortcuts-modal', 'open');
        return () => document.body.removeAttribute('data-shortcuts-modal');
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={isMobile}
            maxWidth="xs"
            fullWidth
            onKeyDown={handleKeyDown}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: alpha(theme.palette.common.black, isDark ? 0.5 : 0.32),
                        backdropFilter: 'blur(4px)',
                    },
                },
                paper: {
                    sx: {
                        borderRadius: isMobile ? 0 : 2,
                        maxHeight: isMobile ? '100%' : 'min(420px, 80vh)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.paper',
                        // Safe area: notched phones + home indicator
                        pt: isMobile ? 'env(safe-area-inset-top, 0px)' : undefined,
                        pb: isMobile ? 'env(safe-area-inset-bottom, 0px)' : undefined,
                    },
                },
            }}
        >
            {/* Compact header */}
            <Box
                sx={{
                    flexShrink: 0,
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 1, sm: 1.25 },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                        <Keyboard sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={700} sx={{ fontSize: '0.95rem', lineHeight: 1.25 }}>
                                Shortcuts
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: '0.7rem', display: 'block' }}
                            >
                                {mac ? '⌘' : 'Ctrl'}+/ · Esc
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton
                        aria-label="Close"
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            minWidth: 44,
                            minHeight: 44,
                            mr: -0.5,
                        }}
                    >
                        <Close />
                    </IconButton>
                </Stack>
                {!isMobile && (
                    <Box
                        component="span"
                        sx={{
                            display: 'inline-block',
                            mt: 0.75,
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'primary.main',
                            bgcolor: alpha(BLUE, isDark ? 0.2 : 0.1),
                        }}
                    >
                        {mac ? 'Mac' : 'Windows'}
                    </Box>
                )}
            </Box>

            {/* Body — tight padding; scrolls */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    px: { xs: 1.5, sm: 2 },
                    pt: 1,
                    pb: { xs: 2, sm: 1.5 },
                }}
            >
                {KEYBOARD_SHORTCUT_SECTIONS.map((section) => (
                    <SectionBlock key={section.title} title={section.title}>
                        {section.items.map((item, idx) => (
                            <ShortcutRow
                                key={item.id}
                                description={item.description}
                                keys={item.keys}
                                isLast={idx === section.items.length - 1}
                            />
                        ))}
                    </SectionBlock>
                ))}
            </Box>
        </Dialog>
    );
}
