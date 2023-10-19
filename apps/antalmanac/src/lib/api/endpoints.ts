function endpointTransform(path: string) {
    // This function is left in for legacy reasons. It is not functionally used anymore. Please refer to getEndpoint() in apps/antalmanac/src/lib/api/trpc.ts
    if (import.meta.env.VITE_ENDPOINT) {
        return `https://${import.meta.env.VITE_ENDPOINT}.api.antalmanac.com${path}`;
    }
    if (import.meta.env.VITE_LOCAL_SERVER) {
        return `http://localhost:3000${path}`;
    }
    return import.meta.env.MODE === 'development'
        ? `https://dev.api.antalmanac.com${path}`
        : `https://api.antalmanac.com${path}`;
}

export const LOOKUP_NOTIFICATIONS_ENDPOINT = endpointTransform('/api/notifications/lookupNotifications');
export const REGISTER_NOTIFICATIONS_ENDPOINT = endpointTransform('/api/notifications/registerNotifications');
export const MAPBOX_PROXY_DIRECTIONS_ENDPOINT = endpointTransform('/mapbox/directions');
export const MAPBOX_PROXY_TILES_ENDPOINT = endpointTransform('/mapbox/tiles');

// PeterPortal API
export const PETERPORTAL_GRAPHQL_ENDPOINT = 'https://staging-107.api-next.peterportal.org/v1/graphql';
export const PETERPORTAL_REST_ENDPOINT = 'https://api-next.peterportal.org/v1/rest';

export const PETERPORTAL_WEBSOC_ENDPOINT = `${PETERPORTAL_REST_ENDPOINT}/websoc`;
