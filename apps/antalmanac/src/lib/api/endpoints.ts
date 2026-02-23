function endpointTransform(path: string) {
    // This function is left in for legacy reasons. It is not functionally used anymore. Please refer to getEndpoint() in apps/antalmanac/src/lib/api/trpc.ts
    if (process.env.NEXT_PUBLIC_ENDPOINT) {
        return `https://${process.env.NEXT_PUBLIC_ENDPOINT}.api.antalmanac.com${path}`;
    }
    if (process.env.NEXT_PUBLIC_LOCAL_SERVER) {
        return `http://localhost:3000${path}`;
    }
    return process.env.NODE_ENV === "development"
        ? `https://dev.api.antalmanac.com${path}`
        : `https://api.antalmanac.com${path}`;
}

export const LOOKUP_NOTIFICATIONS_ENDPOINT = endpointTransform(
    "/api/notifications/lookupNotifications",
);
export const REGISTER_NOTIFICATIONS_ENDPOINT = endpointTransform(
    "/api/notifications/registerNotifications",
);
export const MAPBOX_PROXY_DIRECTIONS_ENDPOINT = endpointTransform("/mapbox/directions");
export const TILES_URL = process.env.NEXT_PUBLIC_TILES_ENDPOINT || "tile.openstreetmap.org";
