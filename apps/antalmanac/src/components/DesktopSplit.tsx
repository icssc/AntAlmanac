'use client';

import { BLUE } from '$src/globals';
import { Box } from '@mui/material';
import { useCallback, useEffect, useRef } from 'react';
import Split from 'split.js';

const DEFAULT_SPLIT_SIZES: [number, number] = [42.5, 57.5];

const splitContainerSx = {
    display: 'flex',
    flexGrow: 1,
    marginTop: 4,
} as const;

const leftPaneSx = {
    width: 'calc(42.5% - 5px)',
    minWidth: 400,
    overflow: 'hidden',
    flexShrink: 0,
} as const;

const rightPaneSx = {
    width: 'calc(57.5% - 5px)',
    minWidth: 0,
    flex: 1,
} as const;

const gutterSx = {
    width: '10px',
    flexShrink: 0,
    backgroundColor: BLUE,
    paddingRight: '1px',
} as const;

interface DesktopSplitProps {
    left: React.ReactNode;
    right: React.ReactNode;
    rightPaneRef?: React.Ref<HTMLDivElement>;
    onRightPaneResize?: () => void;
}

/**
 * Desktop split layout that matches split.js output on SSR to avoid CLS.
 * react-split only initializes in componentDidMount, so we render the gutter
 * and pane widths up front, then attach split.js to the same DOM nodes.
 */
export function DesktopSplit({ left, right, rightPaneRef, onRightPaneResize }: DesktopSplitProps) {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);
    const splitRef = useRef<ReturnType<typeof Split> | null>(null);

    const resetSizes = useCallback(() => {
        splitRef.current?.setSizes(DEFAULT_SPLIT_SIZES);
    }, []);

    useEffect(() => {
        const leftEl = leftRef.current;
        const rightEl = rightRef.current;
        const gutterEl = gutterRef.current;
        if (!leftEl || !rightEl || splitRef.current) {
            return;
        }

        gutterEl?.remove();

        splitRef.current = Split([leftEl, rightEl], {
            sizes: [...DEFAULT_SPLIT_SIZES],
            minSize: 400,
            expandToMin: false,
            gutterSize: 10,
            gutterAlign: 'center',
            snapOffset: 0,
            dragInterval: 1,
            direction: 'horizontal',
            cursor: 'col-resize',
            gutter: () => gutterEl ?? createGutter(resetSizes),
            gutterStyle: () => ({
                backgroundColor: BLUE,
                width: '10px',
                paddingRight: '1px',
            }),
            onDrag: onRightPaneResize,
        });

        onRightPaneResize?.();

        return () => {
            splitRef.current?.destroy();
            splitRef.current = null;
        };
    }, [onRightPaneResize, resetSizes]);

    const setRightPaneRef = useCallback(
        (node: HTMLDivElement | null) => {
            rightRef.current = node;

            if (typeof rightPaneRef === 'function') {
                rightPaneRef(node);
            } else if (rightPaneRef) {
                rightPaneRef.current = node;
            }
        },
        [rightPaneRef]
    );

    return (
        <Box sx={splitContainerSx}>
            <Box ref={leftRef} sx={leftPaneSx}>
                {left}
            </Box>
            <Box ref={gutterRef} className="gutter gutter-horizontal" sx={gutterSx} onDoubleClick={resetSizes} />
            <Box ref={setRightPaneRef} sx={rightPaneSx}>
                {right}
            </Box>
        </Box>
    );
}

function createGutter(onReset: () => void) {
    const el = document.createElement('div');
    el.className = 'gutter gutter-horizontal';
    el.addEventListener('dblclick', onReset);
    return el;
}
