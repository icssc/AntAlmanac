import { PointerEvent, TransitionEvent, useEffect, useRef, useState } from 'react';

/** Dragging the edge narrower than this snaps the sidebar shut. Min/max widths are enforced in CSS. */
const SNAP_CLOSE_WIDTH = 200;

const WIDTH_STORAGE_KEY = 'roadmap__sidebarWidth';
const COLLAPSED_STORAGE_KEY = 'roadmap__sidebarCollapsed';

/**
 * State for the resizable desktop roadmap sidebar.
 */
export function useResizableSidebar() {
    const containerRef = useRef<HTMLDivElement>(null);
    /** Preferred width in px; `null` uses the stylesheet default. */
    const [width, setWidth] = useState<number | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const dragStart = useRef<{ x: number; width: number } | null>(null);

    useEffect(() => {
        try {
            const storedWidth = Number(localStorage.getItem(WIDTH_STORAGE_KEY));
            if (storedWidth > 0) setWidth(storedWidth);
            setCollapsed(localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true');
        } catch {
            // Storage can be unavailable (private mode, blocked site data); fall back to defaults.
        }
    }, []);

    const persist = (nextWidth: number | null, nextCollapsed: boolean) => {
        try {
            if (nextWidth !== null) localStorage.setItem(WIDTH_STORAGE_KEY, String(Math.round(nextWidth)));
            localStorage.setItem(COLLAPSED_STORAGE_KEY, String(nextCollapsed));
        } catch {
            // Persistence is best-effort.
        }
    };

    const changeCollapsed = (next: boolean) => {
        if (next === collapsed) return;
        setIsAnimating(true);
        setCollapsed(next);
    };

    const expand = () => {
        changeCollapsed(false);
        persist(width, false);
    };

    const onPointerDown = (e: PointerEvent<HTMLElement>) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        // Start from the rendered width so CSS clamping doesn't offset the handle from the pointer.
        dragStart.current = { x: e.clientX, width: containerRef.current?.offsetWidth ?? 0 };
        setIsDragging(true);
    };

    const onPointerMove = (e: PointerEvent<HTMLElement>) => {
        if (!dragStart.current) return;
        const pointerWidth = dragStart.current.width + e.clientX - dragStart.current.x;
        const shouldCollapse = pointerWidth < SNAP_CLOSE_WIDTH;
        changeCollapsed(shouldCollapse);
        // Keep the last open width while snapped shut so reopening restores it.
        if (!shouldCollapse) setWidth(pointerWidth);
    };

    const onPointerUp = () => {
        if (!dragStart.current) return;
        dragStart.current = null;
        setIsDragging(false);
        const renderedWidth = collapsed ? width : (containerRef.current?.offsetWidth ?? width);
        setWidth(renderedWidth);
        persist(renderedWidth, collapsed);
    };

    const onTransitionEnd = (e: TransitionEvent<HTMLElement>) => {
        if (e.target === e.currentTarget && e.propertyName === 'width') setIsAnimating(false);
    };

    return {
        containerRef,
        width,
        collapsed,
        isDragging,
        isAnimating,
        expand,
        containerProps: { onTransitionEnd, onTransitionCancel: onTransitionEnd },
        handleProps: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel: onPointerUp,
        },
    };
}
