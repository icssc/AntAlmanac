import { Skeleton } from '@mui/material';
import { ReactNode } from 'react';

/**
 * MUI's Skeleton hides element children but keeps their layout, so each
 * placeholder sizes to the real element it stands in for. Text must be
 * wrapped in an element first.
 */
export const wrapSkeleton = (
    children: ReactNode,
    skeleton: boolean,
    variant: 'text' | 'circular' | 'rounded' = 'rounded'
) =>
    skeleton ? (
        <Skeleton
            variant={variant}
            component="div"
            // flex keeps a circle around an inline icon from stretching to the line height
            sx={{ pointerEvents: 'none', display: variant === 'circular' ? 'flex' : undefined }}
        >
            {children}
        </Skeleton>
    ) : (
        children
    );
