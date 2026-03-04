'use client';

import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Button, type SxProps, type Theme, Typography } from '@mui/material';

type EmptyStateProps = {
    Icon: SvgIconComponent;
    title: string;
    description: string;
    className?: string;
    sx?: SxProps<Theme>;
} & ({ ctaLabel: string; onCtaClick: () => void } | { ctaLabel?: never; onCtaClick?: never });

export function EmptyState({ Icon, title, description, ctaLabel, onCtaClick, className, sx }: EmptyStateProps) {
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
            <Typography variant="body2" color="text.secondary" maxWidth={360}>
                {description}
            </Typography>
            {ctaLabel && (
                <Button variant="contained" onClick={onCtaClick} sx={{ mt: 1 }}>
                    {ctaLabel}
                </Button>
            )}
        </Box>
    );
}
