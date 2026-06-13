import { Header } from '$components/Header/Header';
import { DeviceProvider } from '$providers/DeviceProvider';
import { ClientOnly } from '$src/app/[[...slug]]/client';
import { SeoContent } from '$src/app/[[...slug]]/seo-content';
import { headers } from 'next/headers';
import { userAgent } from 'next/server';

export default async function Page() {
    const ua = userAgent({ headers: await headers() });
    const isMobile = ua.device.type === 'mobile';

    return (
        <DeviceProvider isMobile={isMobile}>
            <SeoContent />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100svh + env(safe-area-inset-top))',
                }}
            >
                <Header />
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ClientOnly />
                </div>
            </div>
        </DeviceProvider>
    );
}
