'use client';

import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Button, type SxProps, type Theme, Typography } from '@mui/material';

interface EmptyStateProps {
    Icon: SvgIconComponent;
    title: string;
    description: string;
    ctaLabel?: string;
    onCtaClick?: () => void;
    sx?: SxProps<Theme>;
}

export function EmptyState({ Icon, title, description, ctaLabel, onCtaClick, sx }: EmptyStateProps) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={1.5}
            textAlign="center"
            p={4}
            sx={sx}
        >
            <Icon sx={{ fontSize: 48, color: 'text.secondary' }} aria-hidden="true" />
            <Typography variant="h6" color="text.primary">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" maxWidth={360}>
                {description}
            </Typography>
            {ctaLabel && onCtaClick && (
                <Button variant="contained" onClick={onCtaClick} sx={{ mt: 1 }}>
                    {ctaLabel}
                </Button>
            )}
        </Box>
    );
}
