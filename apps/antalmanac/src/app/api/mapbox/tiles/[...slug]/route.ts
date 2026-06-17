import { env } from '$src/env';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const MAPBOX_API_URL = 'https://api.mapbox.com';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;

    if (!env.MAPBOX_ACCESS_TOKEN) {
        return new NextResponse('MAPBOX_ACCESS_TOKEN is not set', { status: 500 });
    }

    const slugParts = Array.isArray(slug) ? slug : [slug];
    const style = slugParts[0] === 'dark-v11' ? 'dark-v11' : 'streets-v11';
    const tilePath = (
        slugParts[0] === 'dark-v11' || slugParts[0] === 'streets-v11' ? slugParts.slice(1) : slugParts
    ).join('/');

    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    searchParams.set('access_token', env.MAPBOX_ACCESS_TOKEN);

    const url = `${MAPBOX_API_URL}/styles/v1/mapbox/${style}/tiles/${tilePath}?${searchParams.toString()}`;

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
