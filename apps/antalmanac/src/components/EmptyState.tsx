'use client';

import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Button, type SxProps, type Theme, Typography } from '@mui/material';

export interface EmptyStateAction {
    label: string;
    onClick: () => void;
}

export interface EmptyStateProps {
    Icon: SvgIconComponent;
    title: string;
    description?: string;
    primaryAction?: EmptyStateAction;
    secondaryAction?: EmptyStateAction;
    className?: string;
    sx?: SxProps<Theme>;
}

export function EmptyState({
    Icon,
    title,
    description,
    primaryAction,
    secondaryAction,
    className,
    sx,
}: EmptyStateProps) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={1.5}
            textAlign="center"
            p={4}
            className={className}
            sx={sx}
        >
            <Icon sx={{ fontSize: 48, color: 'text.secondary' }} aria-hidden="true" />
            <Typography variant="h6" color="text.primary">
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" color="text.secondary" maxWidth={360}>
                    {description}
                </Typography>
            )}
            {(primaryAction || secondaryAction) && (
                <Box display="flex" flexWrap="wrap" gap={1} mt={1} justifyContent="center">
                    {primaryAction && (
                        <Button variant="contained" onClick={primaryAction.onClick}>
                            {primaryAction.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button variant="outlined" onClick={secondaryAction.onClick}>
                            {secondaryAction.label}
                        </Button>
                    )}
                </Box>
            )}
        </Box>
    );
}
