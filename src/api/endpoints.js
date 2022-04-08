function endpointTransform(path) {
    console.log(process.env.ENDPOINT_URL);
    if (process.env.NODE_ENV === 'development')
        return process.env.REACT_APP_ENDPOINT_URL
            ? process.env.REACT_APP_ENDPOINT_URL + path
            : `https://dev.api.antalmanac.com${path}`;
    else return `https://api.antalmanac.com${path}`;
}

export const AUTH_ENDPOINT = endpointTransform('/api/auth');
export const WEBSOC_ENDPOINT = endpointTransform('/api/websocapi');
export const LOOKUP_NOTIFICATIONS_ENDPOINT = endpointTransform('/api/notifications/lookupNotifications');
export const REGISTER_NOTIFICATIONS_ENDPOINT = endpointTransform('/api/notifications/registerNotifications');
export const RANDOM_AD_ENDPOINT = endpointTransform('/api/banners/getRandomAd');
export const AD_IMAGE_ENDPOINT = endpointTransform('/api/banners/getAdImage');
export const LOAD_DATA_ENDPOINT = endpointTransform('/api/users/loadUserData');
export const SAVE_DATA_ENDPOINT = endpointTransform('/api/users/saveUserData');
export const ENROLLMENT_DATA_ENDPOINT = endpointTransform('/api/enrollmentData');
export const NEWS_ENDPOINT = endpointTransform('/api/news');

// PeterPortal API
export const PETERPORTAL_GRAPHQL_ENDPOINT = 'https://api.peterportal.org/graphql';
export const PETERPORTAL_REST_ENDPOINT = 'https://api.peterportal.org/rest/v0';
export const PETERPORTAL_WEBSOC_ENDPOINT = `${PETERPORTAL_REST_ENDPOINT}/schedule/soc`;
