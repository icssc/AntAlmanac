export function getAntAlmanacApiEndpoint() {
    if (import.meta.env.VITE_ANTALMANAC_API_ENDPOINT) {
        return import.meta.env.VITE_ANTALMANAC_API_ENDPOINT;
    }

    if (import.meta.env.MODE === 'development') {
        return `https://dev.api.antalmanac.com`;
    }

    return `https://api.antalmanac.com`;
}

// AntAlmanac REST API (to be superseded by tRPC).
export const ANTALMANAC_API_ENDPOINT = getAntAlmanacApiEndpoint();
export const LOOKUP_NOTIFICATIONS_ENDPOINT = `${ANTALMANAC_API_ENDPOINT}/api/notifications/lookupNotifications`;
export const REGISTER_NOTIFICATIONS_ENDPOINT = `${ANTALMANAC_API_ENDPOINT}/api/notifications/registerNotifications`;

// PeterPortal API.
export const PETERPORTAL_GRAPHQL_ENDPOINT = 'https://api-next.peterportal.org/v1/graphql';
export const PETERPORTAL_REST_ENDPOINT = 'https://api-next.peterportal.org/v1/rest';
export const PETERPORTAL_WEBSOC_ENDPOINT = `${PETERPORTAL_REST_ENDPOINT}/websoc`;
