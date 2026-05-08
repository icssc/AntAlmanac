import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'My Schedule',
    description:
        'View and manage your saved UCI course schedule. See added courses, check for conflicts, and export your schedule.',
    alternates: {
        canonical: 'https://antalmanac.com/added',
    },
};

export default function AddedPage() {
    return (
        <div className="sr-only" role="complementary" aria-label="My Schedule">
            <h1>My Schedule — AntAlmanac</h1>
            <p>
                View and manage your saved UCI course schedule. See all added courses at a glance, check unit totals,
                and manage multiple schedule variations.
            </p>
        </div>
    );
}
