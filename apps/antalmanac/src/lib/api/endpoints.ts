import { env } from '$src/env';

/** Builds absolute URLs for legacy REST proxies (e.g. Mapbox). tRPC calls use the client in `$lib/api/trpc`. */
function endpointTransform(path: string) {
    if (env.NEXT_PUBLIC_ENDPOINT) {
        return `https://${env.NEXT_PUBLIC_ENDPOINT}.api.antalmanac.com${path}`;
    }
    if (env.NEXT_PUBLIC_LOCAL_SERVER) {
        return `http://localhost:3000${path}`;
    }
    return process.env.NODE_ENV === 'development'
        ? `https://dev.api.antalmanac.com${path}`
        : `https://api.antalmanac.com${path}`;
}

export const MAPBOX_PROXY_DIRECTIONS_ENDPOINT = endpointTransform('/mapbox/directions');
export const MAPBOX_PROXY_TILES_ENDPOINT = endpointTransform('/mapbox/tiles');
