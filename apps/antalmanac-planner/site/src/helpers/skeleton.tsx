import { Skeleton } from '@mui/material';
import { ReactNode } from 'react';

/**
 * MUI's Skeleton hides element children but keeps their layout, so each
 * placeholder sizes to the real element it stands in for. Text must be
 * wrapped in an element first.
 *
 * `component` picks the skeleton's root element. Use `span` inside headings,
 * spans, and buttons, where a block element would be invalid; `div` (the
 * default) is for block contexts such as paragraphs and tables.
 */
export const wrapSkeleton = (
    children: ReactNode,
    skeleton: boolean,
    variant: 'text' | 'circular' | 'rounded' = 'rounded',
    component: 'div' | 'span' = 'div'
) =>
    skeleton ? (
        <Skeleton
            variant={variant}
            component={component}
            // flex keeps a circle around an inline icon from stretching to the line height
            sx={{ pointerEvents: 'none', display: variant === 'circular' ? 'flex' : undefined }}
        >
            {children}
        </Skeleton>
    ) : (
        children
    );
