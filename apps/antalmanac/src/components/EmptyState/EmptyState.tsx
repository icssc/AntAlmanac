'use client';

import { Box, Button, SxProps, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface EmptyStateAction {
    label: string;
    onClick: () => void;
}

export interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    primaryAction?: EmptyStateAction;
    secondaryAction?: EmptyStateAction;
    sx?: SxProps;
}

/**
 * Empty state pattern: icon, heading, description, and primary/secondary actions.
 * Use when a list or view has no content to prompt the user toward the next step.
 */
export function EmptyState({ icon, title, description, primaryAction, secondaryAction, sx }: EmptyStateProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                py: 3,
                px: 2,
                ...sx,
            }}
        >
            {icon != null && (
                <Box
                    sx={{
                        color: 'text.secondary',
                        mb: 1.5,
                        '& .MuiSvgIcon-root': { fontSize: 48 },
                    }}
                >
                    {icon}
                </Box>
            )}
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                {title}
            </Typography>
            {description != null && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 320 }}>
                    {description}
                </Typography>
            )}
            {(primaryAction != null || secondaryAction != null) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {primaryAction != null && (
                        <Button variant="contained" onClick={primaryAction.onClick} size="medium">
                            {primaryAction.label}
                        </Button>
                    )}
                    {secondaryAction != null && (
                        <Button variant="outlined" onClick={secondaryAction.onClick} size="medium">
                            {secondaryAction.label}
                        </Button>
                    )}
                </Box>
            )}
        </Box>
    );
}
