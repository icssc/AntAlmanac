/**
 * Centralized container query definitions.
 *
 * Similar to `queryKeys.ts` for TanStack Query, this file is the single
 * source of truth for CSS container names and query builders used throughout
 * the app.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries
 */

export const containers = {
    toolbar: 'toolbar',
    scheduleManagement: 'schedule-management',
    manualSearch: 'manual-search',
    quickSearch: 'quick-search',
} as const;

type ContainerName = (typeof containers)[keyof typeof containers];

/**
 * Returns the `sx` properties needed to make an element a sized container.
 */
export function containerSx(name: ContainerName) {
    return { containerType: 'inline-size', containerName: name } as const;
}

/**
 * Builds a `@container` query string for use as an `sx` prop key.
 *
 * @example
 * sx={{ [containerQuery(containers.toolbar, 500)]: { display: 'none' } }}
 */
export function containerQuery(name: ContainerName, maxWidth: number) {
    return `@container ${name} (max-width: ${maxWidth}px)`;
}
