function endpointTransform(path) {
    if (process.env.NODE_ENV === 'development') return path;
    else return `https://api.antalmanacdev.de${path}`;
}

export const WEBSOC_ENDPOINT = endpointTransform('/api/websocapi');
export const LOOKUP_NOTIFICATIONS_ENDPOINT = endpointTransform('/api/notifications/lookupNotifications');
export const REGISTER_NOTIFICATIONS_ENDPOINT = endpointTransform('/api/notifications/registerNotifications');
export const RANDOM_AD_ENDPOINT = endpointTransform('/api/ads/getRandomAd');
export const AD_IMAGE_ENDPOINT = endpointTransform('/api/ads/getAdImage/');
export const LOAD_DATA_ENDPOINT = endpointTransform('/api/users/loadUserData');
export const SAVE_DATA_ENDPOINT = endpointTransform('api/users/saveUserData');
export const ENROLLMENT_DATA_ENDPOINT = endpointTransform('/api/enrollmentData');
