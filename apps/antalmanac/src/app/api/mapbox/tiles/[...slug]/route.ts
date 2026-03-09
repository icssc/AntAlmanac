import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { backendEnvSchema } from '$src/backend/env';

const MAPBOX_API_URL = 'https://api.mapbox.com';

const env = backendEnvSchema.parse(process.env);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;

    if (!env.MAPBOX_ACCESS_TOKEN) {
        return new NextResponse('MAPBOX_ACCESS_TOKEN is not set', { status: 500 });
    }

    const path = Array.isArray(slug) ? slug.join('/') : slug;

    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    searchParams.set('access_token', env.MAPBOX_ACCESS_TOKEN);

    const url = `${MAPBOX_API_URL}/styles/v1/mapbox/streets-v11/tiles/${path}?${searchParams.toString()}`;

    const upstreamRes = await fetch(url, {
        cache: 'no-store',
    });

    const contentType = upstreamRes.headers.get('content-type') ?? 'image/png';
    const buffer = await upstreamRes.arrayBuffer();

    return new NextResponse(buffer, {
        status: upstreamRes.status,
        headers: {
            'content-type': contentType,
        },
    });
}
