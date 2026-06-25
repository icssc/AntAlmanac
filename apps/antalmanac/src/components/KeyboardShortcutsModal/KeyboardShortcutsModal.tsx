'use client';

import {
    KEYBOARD_SHORTCUT_SECTIONS,
    formatShortcutKeys,
    isMacPlatform,
    type ShortcutKey,
    type ShortcutSectionIcon,
} from '$lib/keyboardShortcuts';
import { ChatBubbleOutlineOutlined, Close, Keyboard, SearchOutlined, SettingsOutlined } from '@mui/icons-material';
import { Box, Dialog, IconButton, Stack, Typography, useMediaQuery, useTheme, alpha, type Theme } from '@mui/material';
import { useCallback, useEffect } from 'react';

function SectionHeaderIcon({ icon }: { icon: ShortcutSectionIcon }) {
    const sx = { fontSize: 'small' as const, color: (theme: Theme) => theme.vars.palette.secondary.main };
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
            sx={(theme) => ({
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
                color: theme.vars.palette.text.primary,
                bgcolor: alpha(theme.vars.palette.text.primary, 0.06),
                ...theme.applyStyles('dark', {
                    bgcolor: alpha(theme.vars.palette.common.white, 0.1),
                }),
                border: '1px solid',
                borderColor: theme.vars.palette.divider,
            })}
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
                            sx={(theme) => ({
                                color: theme.vars.palette.text.disabled,
                                fontWeight: 600,
                            })}
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
            sx={(theme) => ({
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                py: 1,
                borderBottom: isLast ? 'none' : '1px solid',
                borderColor: theme.vars.palette.divider,
            })}
        >
            <Typography
                variant="body1"
                sx={(theme) => ({
                    lineHeight: 1.45,
                    color: theme.vars.palette.text.secondary,
                    flex: 1,
                    minWidth: 0,
                    pr: { sm: 2 },
                    overflowWrap: 'anywhere',
                })}
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
    return (
        <Box sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
            <Stack
                direction="row"
                alignItems="center"
                gap={1}
                sx={(theme) => ({
                    pb: 1,
                    mb: 0.5,
                    borderBottom: '1px solid',
                    borderColor: theme.vars.palette.divider,
                })}
            >
                <SectionHeaderIcon icon={icon} />
                <Typography
                    component="h2"
                    variant="caption"
                    sx={(theme) => ({
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: theme.vars.palette.secondary.main,
                    })}
                >
                    {title}
                </Typography>
            </Stack>
            <Box>{children}</Box>
        </Box>
    );
}

interface KeyboardShortcutsModalProps {
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
                    sx: (t: Theme) => ({
                        backgroundColor: alpha(t.vars.palette.common.black, 0.36),
                        backdropFilter: 'blur(6px)',
                        ...t.applyStyles('dark', {
                            backgroundColor: alpha(t.vars.palette.common.black, 0.55),
                        }),
                    }),
                },
                paper: {
                    sx: (t) => ({
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
                        bgcolor: t.vars.palette.background.paper,
                        border: isFullScreenLayout ? 'none' : '1px solid',
                        borderColor: t.vars.palette.divider,
                        boxShadow: isFullScreenLayout ? 'none' : t.shadows[8],
                        ...(!isFullScreenLayout &&
                            t.applyStyles('dark', {
                                boxShadow: t.shadows[16],
                            })),
                        pt: isFullScreenLayout ? 'env(safe-area-inset-top, 0px)' : undefined,
                        pb: isFullScreenLayout ? 'env(safe-area-inset-bottom, 0px)' : undefined,
                    }),
                },
            }}
        >
            <Box
                sx={(t) => ({
                    flexShrink: 0,
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: t.vars.palette.divider,
                })}
            >
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                    <Stack direction="row" alignItems="flex-start" gap={1.5} sx={{ minWidth: 0 }}>
                        <Keyboard
                            sx={(t) => ({
                                fontSize: 30,
                                color: t.vars.palette.secondary.main,
                                flexShrink: 0,
                                mt: 0.25,
                            })}
                        />
                        <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" useFlexGap>
                                <Typography
                                    component="h1"
                                    variant="h5"
                                    id="keyboard-shortcuts-title"
                                    sx={(t) => ({
                                        fontWeight: 700,
                                        lineHeight: 1.2,
                                        color: t.vars.palette.text.primary,
                                    })}
                                >
                                    Shortcuts
                                </Typography>
                                <Box
                                    component="span"
                                    sx={(t) => ({
                                        px: 1,
                                        py: 0.35,
                                        borderRadius: 1,
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                        color: t.vars.palette.secondary.main,
                                        bgcolor: alpha(t.vars.palette.secondary.main, 0.12),
                                        border: '1px solid',
                                        borderColor: alpha(t.vars.palette.secondary.main, 0.28),
                                        ...t.applyStyles('dark', {
                                            bgcolor: alpha(t.vars.palette.secondary.main, 0.2),
                                            borderColor: alpha(t.vars.palette.secondary.main, 0.4),
                                        }),
                                    })}
                                >
                                    {mac ? 'Mac' : 'Windows'}
                                </Box>
                            </Stack>
                            <Typography
                                variant="caption"
                                sx={(t) => ({
                                    mt: 0.75,
                                    fontFamily:
                                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                                    color: t.vars.palette.text.secondary,
                                    letterSpacing: '0.02em',
                                })}
                            >
                                {mac ? '⌘' : 'Ctrl'} + / to toggle
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton
                        aria-label="Close"
                        onClick={onClose}
                        sx={(t) => ({
                            color: t.vars.palette.text.secondary,
                            minWidth: 44,
                            minHeight: 44,
                            mr: -0.75,
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: t.vars.palette.divider,
                            bgcolor: alpha(t.vars.palette.text.primary, 0.04),
                            ...t.applyStyles('dark', {
                                bgcolor: alpha(t.vars.palette.text.primary, 0.06),
                            }),
                            '&:hover': {
                                bgcolor: t.vars.palette.action.hover,
                            },
                        })}
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
