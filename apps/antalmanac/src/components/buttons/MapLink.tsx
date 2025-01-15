import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { MOBILE_BREAKPOINT } from '../../globals';

interface MapLinkProps {
    buildingId: number;
    room: string;
    isDark: boolean;
    setActiveTab: (tab: number) => void;
}

const MapLink: React.FC<MapLinkProps> = ({ buildingId, room, isDark, setActiveTab }) => {
    
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    const focusMap = useCallback(() => {
        setActiveTab(isMobileScreen ? 3 : 2);
    }, [isMobileScreen, setActiveTab]);

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

export default MapLink;
