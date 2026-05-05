'use client';

import {
    KEYBOARD_SHORTCUT_SECTIONS,
    formatShortcutKeys,
    isMacPlatform,
    type ShortcutKey,
    type ShortcutSectionIcon,
} from '$lib/keyboardShortcuts';
import { ChatBubbleOutlineOutlined, Close, Keyboard, SearchOutlined, SettingsOutlined } from '@mui/icons-material';
import { Box, Dialog, IconButton, Stack, Typography, useMediaQuery, useTheme, alpha } from '@mui/material';
import { useCallback, useEffect } from 'react';

/** Accent blue: theme maps light → primary (BLUE), dark → secondary (LIGHT_BLUE) — matches links & app chrome */
function useShortcutsAccentColor() {
    const theme = useTheme();
    return theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.main;
}

function SectionHeaderIcon({ icon }: { icon: ShortcutSectionIcon }) {
    const accent = useShortcutsAccentColor();
    const sx = { fontSize: 'small' as const, color: accent };
    switch (icon) {
        case 'general':
            return <SettingsOutlined sx={sx} aria-hidden />;
        case 'search':
            return <SearchOutlined sx={sx} aria-hidden />;
        case 'dialogs':
            return <ChatBubbleOutlineOutlined sx={sx} aria-hidden />;
    }
}

function Kbd({ children }: { children: React.ReactNode }) {
    return (
        <Box
            component="kbd"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 28,
                minWidth: 28,
                px: 0.75,
                py: 0.25,
                borderRadius: 1.25,
                fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
                fontSize: 'inherit',
                fontWeight: 600,
                lineHeight: 1.2,
                color: 'text.primary',
                bgcolor: (t) =>
                    t.palette.mode === 'dark'
                        ? alpha(t.palette.common.white, 0.1)
                        : alpha(t.palette.text.primary, 0.06),
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
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.5} justifyContent="flex-end" useFlexGap>
            {parts.map((part, i) => (
                <Stack key={i} direction="row" alignItems="center" gap={0.5}>
                    {i > 0 && (
                        <Typography
                            component="span"
                            variant="caption"
                            sx={{
                                color: 'text.disabled',
                                fontWeight: 600,
                            }}
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
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                py: 1,
                borderBottom: isLast ? 'none' : '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography
                variant="body1"
                sx={{
                    lineHeight: 1.45,
                    color: 'text.secondary',
                    flex: 1,
                    minWidth: 0,
                    pr: { sm: 2 },
                    overflowWrap: 'anywhere',
                }}
            >
                {description}
            </Typography>
            <Box
                sx={{
                    flexShrink: 0,
                    alignSelf: 'center',
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <KeyCombo keys={keys} />
            </Box>
        </Box>
    );
}

function SectionBlock({
    title,
    icon,
    children,
}: {
    title: string;
    icon: ShortcutSectionIcon;
    children: React.ReactNode;
}) {
    const accent = useShortcutsAccentColor();

    return (
        <Box sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
            <Stack
                direction="row"
                alignItems="center"
                gap={1}
                sx={{
                    pb: 1,
                    mb: 0.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <SectionHeaderIcon icon={icon} />
                <Typography
                    component="h2"
                    variant="caption"
                    sx={{
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: accent,
                    }}
                >
                    {title}
                </Typography>
            </Stack>
            <Box>{children}</Box>
        </Box>
    );
}

export interface KeyboardShortcutsModalProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Shortcuts reference: section icons, keycaps, full-screen on small viewports + safe areas.
 */
export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
    const theme = useTheme();
    const isFullScreenLayout = useMediaQuery(theme.breakpoints.down('md'));
    const mac = isMacPlatform();
    const accent = theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.main;

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
            fullScreen={isFullScreenLayout}
            maxWidth="md"
            fullWidth
            onKeyDown={handleKeyDown}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: (t) => alpha(t.palette.common.black, t.palette.mode === 'dark' ? 0.55 : 0.36),
                        backdropFilter: 'blur(6px)',
                    },
                },
                paper: {
                    sx: {
                        borderRadius: isFullScreenLayout ? 0 : 3,
                        ...(isFullScreenLayout
                            ? {
                                  height: '100%',
                                  maxHeight: '100dvh',
                              }
                            : {
                                  maxWidth: { md: 880 },
                                  maxHeight: 'min(640px, 88vh)',
                              }),
                        minHeight: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.paper',
                        border: isFullScreenLayout ? 'none' : '1px solid',
                        borderColor: 'divider',
                        boxShadow: isFullScreenLayout
                            ? 'none'
                            : (t) => (t.palette.mode === 'dark' ? t.shadows[16] : t.shadows[8]),
                        pt: isFullScreenLayout ? 'env(safe-area-inset-top, 0px)' : undefined,
                        pb: isFullScreenLayout ? 'env(safe-area-inset-bottom, 0px)' : undefined,
                    },
                },
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                    <Stack direction="row" alignItems="flex-start" gap={1.5} sx={{ minWidth: 0 }}>
                        <Keyboard
                            sx={{
                                fontSize: 30,
                                color: accent,
                                flexShrink: 0,
                                mt: 0.25,
                            }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" useFlexGap>
                                <Typography
                                    component="h1"
                                    variant="h5"
                                    id="keyboard-shortcuts-title"
                                    sx={{
                                        fontWeight: 700,
                                        lineHeight: 1.2,
                                        color: 'text.primary',
                                    }}
                                >
                                    Shortcuts
                                </Typography>
                                <Box
                                    component="span"
                                    sx={{
                                        px: 1,
                                        py: 0.35,
                                        borderRadius: 1,
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        color: accent,
                                        bgcolor: (t) =>
                                            alpha(
                                                t.palette.mode === 'dark'
                                                    ? t.palette.secondary.main
                                                    : t.palette.primary.main,
                                                t.palette.mode === 'dark' ? 0.2 : 0.12
                                            ),
                                        border: '1px solid',
                                        borderColor: (t) =>
                                            alpha(
                                                t.palette.mode === 'dark'
                                                    ? t.palette.secondary.main
                                                    : t.palette.primary.main,
                                                t.palette.mode === 'dark' ? 0.4 : 0.28
                                            ),
                                    }}
                                >
                                    {mac ? 'Mac' : 'Windows'}
                                </Box>
                            </Stack>
                            <Typography
                                variant="caption"
                                sx={{
                                    mt: 0.75,
                                    fontFamily:
                                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                                    color: 'text.secondary',
                                    letterSpacing: '0.02em',
                                }}
                            >
                                {mac ? '⌘' : 'Ctrl'} + / to toggle
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton
                        aria-label="Close"
                        onClick={onClose}
                        sx={{
                            color: 'text.secondary',
                            minWidth: 44,
                            minHeight: 44,
                            mr: -0.75,
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: (t) => alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.06 : 0.04),
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    px: 3,
                    pt: 2,
                    pb: isFullScreenLayout
                        ? `calc(${theme.spacing(2.5)} + env(safe-area-inset-bottom, 0px))`
                        : theme.spacing(2.5),
                }}
            >
                {KEYBOARD_SHORTCUT_SECTIONS.map((section) => (
                    <SectionBlock key={section.title} title={section.title} icon={section.icon}>
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
