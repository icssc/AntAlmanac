import { FEEDBACK_LINK } from '$src/globals';
import { NextResponse } from 'next/server';

export function GET() {
    return NextResponse.redirect(FEEDBACK_LINK, 308);
}
