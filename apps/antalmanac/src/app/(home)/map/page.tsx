import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Campus Map',
    description:
        'See where your UCI classes meet on an interactive campus map. Get walking directions between buildings and plan your route between back-to-back classes.',
    alternates: {
        canonical: 'https://antalmanac.com/map',
    },
};

export default function MapPage() {
    return (
        <div className="sr-only" role="complementary" aria-label="Interactive UCI Campus Map">
            <h1>UCI Campus Map — AntAlmanac</h1>
            <p>
                See where your UCI classes meet on an interactive campus map. Get walking directions between buildings
                and plan your route between back-to-back classes.
            </p>
        </div>
    );
}
