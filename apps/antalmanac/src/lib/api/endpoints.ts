import { env } from '$src/env';

const MAPBOX_LIGHT_STYLE = 'streets-v11';
const MAPBOX_DARK_STYLE = 'dark-v11';

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

function mapboxTilesProxyUrl(style: typeof MAPBOX_LIGHT_STYLE | typeof MAPBOX_DARK_STYLE): string {
    const proxyBase = env.NEXT_PUBLIC_LOCAL_SERVER
        ? 'http://localhost:3000/api/mapbox/tiles'
        : endpointTransform('/mapbox/tiles');
    return `${proxyBase}/${style}/512/{z}/{x}/{y}@2x`;
}

/**
 * Leaflet tile URL for the campus map.
 *
 * Light: `https://{CDN}/{z}/{x}/{y}.png` (or OSM when no CDN is configured).
 * Dark: `https://{CDN}/dark/{z}/{x}/{y}.png` when `NEXT_PUBLIC_TILES_DARK_ON_CDN=true`,
 * otherwise the Mapbox proxy at `/mapbox/tiles/dark-v11/512/{z}/{x}/{y}@2x`.
 */
export function getMapTileLayerUrl(isDark: boolean): string {
    const cdnHost = env.NEXT_PUBLIC_TILES_ENDPOINT;

    if (!isDark) {
        if (cdnHost) {
            return `https://${cdnHost}/{z}/{x}/{y}.png`;
        }
        return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    if (cdnHost && env.NEXT_PUBLIC_TILES_DARK_ON_CDN === 'true') {
        return `https://${cdnHost}/dark/{z}/{x}/{y}.png`;
    }

    return mapboxTilesProxyUrl(MAPBOX_DARK_STYLE);
}
