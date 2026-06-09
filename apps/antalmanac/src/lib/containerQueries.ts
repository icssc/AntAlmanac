/**
 * Centralized container name constants for CSS container queries.
 *
 * Components declare a container by setting `containerType: 'inline-size'`
 * and `containerName: CONTAINER_NAMES.<key>` on a wrapper element, then
 * reference the same name in descendant `@container` query strings.
 */
export const CONTAINER_NAMES = {
    toolbar: 'toolbar',
    manualSearch: 'manualSearch',
    scheduleManagement: 'scheduleManagement',
} as const;
