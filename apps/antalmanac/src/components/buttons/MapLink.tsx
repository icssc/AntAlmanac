import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useThemeStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';

interface MapLinkProps {
    buildingId: number;
    room: string;
}

export const MapLink = ({ buildingId, room }: MapLinkProps) => {
    const { setActiveTab } = useTabStore();
    const isDark = useThemeStore((store) => store.isDark);

    const focusMap = useCallback(() => {
        setActiveTab('map');
    }, [setActiveTab]);

    return (
        <Link
            to={`/map?location=${buildingId}`}
            onClick={focusMap}
            style={{
                textDecoration: 'none',
                color: isDark ? 'dodgerblue' : 'blue',
            }}
        >
            {room}
        </Link>
    );
};
