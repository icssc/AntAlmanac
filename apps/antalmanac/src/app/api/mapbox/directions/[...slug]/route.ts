import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { backendEnvSchema } from '$src/backend/env';

const MAPBOX_API_URL = 'https://api.mapbox.com';

const env = backendEnvSchema.parse(process.env);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
    if (!env.MAPBOX_ACCESS_TOKEN) {
        return new NextResponse('MAPBOX_ACCESS_TOKEN is not set', { status: 500 });
    }

    const path = Array.isArray(params.slug) ? params.slug.join('/') : params.slug;

    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    searchParams.set('access_token', env.MAPBOX_ACCESS_TOKEN);

    const url = `${MAPBOX_API_URL}/directions/v5/${path}?${searchParams.toString()}`;

    const upstreamRes = await fetch(url, {
        cache: 'no-store',
    });

    return new NextResponse(upstreamRes.body, {
        status: upstreamRes.status,
        headers: {
            'content-type': upstreamRes.headers.get('content-type') ?? 'application/json',
        },
    });
}
