import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useSecondaryColor } from '$hooks/useSecondary';
import { useTabStore } from '$stores/TabStore';

interface MapLinkProps {
    buildingId: number;
    room: string;
}

export const MapLink = ({ buildingId, room }: MapLinkProps) => {
    const { setActiveTab } = useTabStore();
    const secondaryColor = useSecondaryColor();

    const focusMap = useCallback(() => {
        setActiveTab('map');
    }, [setActiveTab]);

    return (
        <Link
            to={`/map?location=${buildingId}`}
            onClick={focusMap}
            style={{
                color: secondaryColor,
                textDecoration: 'none',
            }}
        >
            {room}
        </Link>
    );
};
