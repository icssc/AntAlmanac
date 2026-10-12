import { Skeleton } from '@mui/material';
import { ReactNode } from 'react';

/**
 * MUI's Skeleton hides element children but keeps their layout, so each
 * placeholder sizes to the real element it stands in for. Text must be
 * wrapped in an element first.
 */
export const wrapSkeleton = (children: ReactNode, skeleton: boolean) =>
    skeleton ? (
        <Skeleton variant="rounded" component="div" sx={{ pointerEvents: 'none' }}>
            {children}
        </Skeleton>
    ) : (
        children
    );
