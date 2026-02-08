import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useIsSharedSchedulePage } from '$hooks/useIsSharedSchedulePage';
import { useTabStore } from '$stores/TabStore';

interface MapLinkProps {
    buildingId: number;
    room: string;
}

export const MapLink = ({ buildingId, room }: MapLinkProps) => {
    const { setActiveTab } = useTabStore();
    const { pathname } = useLocation();
    const isSharedPath = useIsSharedSchedulePage();

    const toLocation = isSharedPath ? `${pathname}?location=${buildingId}` : `/map?location=${buildingId}`;

    const focusMap = useCallback(() => {
        setActiveTab('map');
    }, [setActiveTab]);

    return (
        <Link
            to={toLocation}
            onClick={focusMap}
            style={{
                textDecoration: 'none',
            }}
        >
            {room}
        </Link>
    );
};
