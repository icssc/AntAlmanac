export function getAntAlmanacApiEndpoint() {
    // Can manually set the VITE_API_ENDPOINT environment variable.
    // e.g. during staging deployments, it might be
    // "VITE_API_ENDPOINT=https://staging-123.api.antalmanac.com" or
    // "VITE_API_ENDPOINT=https://dev.api.antalmanac.com".
    if (import.meta.env.VITE_API_ENDPOINT) {
        return import.meta.env.VITE_API_ENDPOINT;
    }

    // If using the local backend server, set the VITE_LOCAL_SERVER environment variable to a truthy value.
    // e.g. "VITE_LOCAL_SERVER=true"
    if (import.meta.env.VITE_LOCAL_SERVER) {
        return `http://localhost:3000`;
    }

    // Otherwise, use the dedicated production endpoint or development endpoint.
    return import.meta.env.MODE === 'development' ? `https://dev.api.antalmanac.com` : `https://api.antalmanac.com`;
}

// AntAlmanac REST API (to be superseded by tRPC).
export const ANTALMANAC_API_ENDPOINT = getAntAlmanacApiEndpoint();
export const LOOKUP_NOTIFICATIONS_ENDPOINT = `${ANTALMANAC_API_ENDPOINT}/api/notifications/lookupNotifications`;
export const REGISTER_NOTIFICATIONS_ENDPOINT = `${ANTALMANAC_API_ENDPOINT}/api/notifications/registerNotifications`;

// PeterPortal API.
export const PETERPORTAL_GRAPHQL_ENDPOINT = 'https://api-next.peterportal.org/v1/graphql';
export const PETERPORTAL_REST_ENDPOINT = 'https://api-next.peterportal.org/v1/rest';
export const PETERPORTAL_WEBSOC_ENDPOINT = `${PETERPORTAL_REST_ENDPOINT}/websoc`;
