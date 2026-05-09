import { useTabStore } from '$stores/TabStore';
import Link from 'next/link';
import { useCallback } from 'react';

interface MapLinkProps {
    buildingId: number;
    room: string;
}

export const MapLink = ({ buildingId, room }: MapLinkProps) => {
    const { setActiveTab } = useTabStore();

    const focusMap = useCallback(() => {
        setActiveTab('map');
    }, [setActiveTab]);

    return (
        <Link
            href={`/map?location=${buildingId}`}
            onClick={focusMap}
            style={{
                textDecoration: 'none',
            }}
        >
            {room}
        </Link>
    );
};
