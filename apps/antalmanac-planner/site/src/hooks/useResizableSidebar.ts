import { KeyboardEvent, PointerEvent, TransitionEvent, useEffect, useRef, useState } from 'react';

/** Keep in sync with DesktopRoadmapSidebar.scss and `$roadmap-sidebar-width` in globals.scss. */
const SIDEBAR_MIN_WIDTH = 300;
const SIDEBAR_MAX_WIDTH = 640;
const SIDEBAR_MAX_VIEWPORT_FRACTION = 0.5;
const SIDEBAR_DEFAULT_WIDTH = 368;

/** Dragging the edge narrower than this snaps the sidebar shut. */
const SNAP_CLOSE_WIDTH = 200;
const KEYBOARD_STEP = 16;

const WIDTH_STORAGE_KEY = 'roadmap__sidebarWidth';
const COLLAPSED_STORAGE_KEY = 'roadmap__sidebarCollapsed';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Applies the same constraints as the stylesheet's `clamp()`, including the viewport cap. */
const constrainWidth = (width: number) =>
    clamp(width, SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, window.innerWidth * SIDEBAR_MAX_VIEWPORT_FRACTION));

interface DragState {
    pointerId: number;
    startX: number;
    startWidth: number;
    /** Latest constrained width the pointer asked for; `null` until the pointer moves. */
    width: number | null;
    collapsed: boolean;
}

/**
 * State for the resizable desktop roadmap sidebar.
 */
export function useResizableSidebar() {
    const containerRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    /** Last open width in px; `null` uses the stylesheet default. Kept while collapsed so reopening restores it. */
    const [width, setWidth] = useState<number | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const drag = useRef<DragState | null>(null);

    useEffect(() => {
        try {
            const storedWidth = Number(localStorage.getItem(WIDTH_STORAGE_KEY));
            if (storedWidth > 0) setWidth(constrainWidth(storedWidth));
            setCollapsed(localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true');
        } catch {
            // Storage can be unavailable (private mode, blocked site data); fall back to defaults.
        }
    }, []);

    /** Width the pane is resting at (ignoring the viewport cap, which is applied whenever a width is committed). */
    const openWidth = clamp(width ?? SIDEBAR_DEFAULT_WIDTH, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH);

    const persist = (nextWidth: number | null, nextCollapsed: boolean) => {
        try {
            if (nextWidth !== null) localStorage.setItem(WIDTH_STORAGE_KEY, String(Math.round(nextWidth)));
            localStorage.setItem(COLLAPSED_STORAGE_KEY, String(nextCollapsed));
        } catch {
            // Persistence is best-effort.
        }
    };

    const changeCollapsed = (next: boolean, current = collapsed) => {
        if (next === current) return;
        setIsAnimating(true);
        setCollapsed(next);
    };

    const setOpenWidth = (next: number) => {
        const constrained = constrainWidth(next);
        setWidth(constrained);
        changeCollapsed(false);
        persist(constrained, false);
    };

    const toggleCollapsed = () => {
        changeCollapsed(!collapsed);
        persist(width, !collapsed);
    };

    /** Reopens the pane and hands focus to the splitter, since the reopen button unmounts. */
    const expand = () => {
        changeCollapsed(false);
        persist(width, false);
        handleRef.current?.focus();
    };

    const onPointerDown = (e: PointerEvent<HTMLElement>) => {
        if (drag.current || e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = {
            pointerId: e.pointerId,
            startX: e.clientX,
            // The gesture starts where the handle is drawn, so the edge stays under the pointer.
            startWidth: containerRef.current?.offsetWidth ?? 0,
            width: null,
            collapsed,
        };
        setIsDragging(true);
    };

    const onPointerMove = (e: PointerEvent<HTMLElement>) => {
        const current = drag.current;
        if (!current || e.pointerId !== current.pointerId) return;
        const pointerWidth = current.startWidth + e.clientX - current.startX;
        const shouldCollapse = pointerWidth < SNAP_CLOSE_WIDTH;
        changeCollapsed(shouldCollapse, current.collapsed);
        current.collapsed = shouldCollapse;
        if (!shouldCollapse) {
            current.width = constrainWidth(pointerWidth);
            setWidth(current.width);
        }
    };

    /** Commits the gesture's final target, never the rendered width, which may be mid-animation. */
    const endDrag = (e: PointerEvent<HTMLElement>) => {
        const current = drag.current;
        if (!current || e.pointerId !== current.pointerId) return;
        drag.current = null;
        setIsDragging(false);
        persist(current.width ?? width, current.collapsed);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        if (drag.current) return;
        switch (e.key) {
            case 'Enter':
            case ' ':
                toggleCollapsed();
                break;
            case 'ArrowLeft':
                if (collapsed) return;
                setOpenWidth(openWidth - KEYBOARD_STEP);
                break;
            case 'ArrowRight':
                setOpenWidth(collapsed ? openWidth : openWidth + KEYBOARD_STEP);
                break;
            case 'Home':
                setOpenWidth(SIDEBAR_MIN_WIDTH);
                break;
            case 'End':
                setOpenWidth(SIDEBAR_MAX_WIDTH);
                break;
            default:
                return;
        }
        e.preventDefault();
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
            ref: handleRef,
            'aria-valuenow': collapsed ? 0 : Math.round(openWidth),
            'aria-valuemin': 0,
            'aria-valuemax': SIDEBAR_MAX_WIDTH,
            'aria-valuetext': collapsed ? 'Sidebar hidden' : `${Math.round(openWidth)} pixels wide`,
            onPointerDown,
            onPointerMove,
            onPointerUp: endDrag,
            onPointerCancel: endDrag,
            onLostPointerCapture: endDrag,
            onKeyDown,
        },
    };
}
