import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useTabStore } from '$stores/TabStore';

interface MapLinkProps {
    buildingId: number;
    room: string;
}

export const MapLink = ({ buildingId, room }: MapLinkProps) => {
    const { setActiveTab } = useTabStore();
    const { pathname } = useLocation();

    const isHomePage = pathname === '/' || pathname == '/added' || pathname == '/map';
    const toLocation = isHomePage ? `/map?location=${buildingId}` : `${pathname}?location=${buildingId}`;

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
