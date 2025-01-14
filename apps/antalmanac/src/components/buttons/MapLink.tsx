import React from 'react';
import { Link } from 'react-router-dom';

interface MapLinkProps {
    buildingId: number;
    buildingName: string;
    focusMap: () => void;
    isDark: boolean;
}

const MapLink: React.FC<MapLinkProps> = ({ buildingId, buildingName, focusMap, isDark }) => {
    return (
        <Link
            to={`/map?location=${buildingId}`}
            onClick={focusMap}
            style={{
                textDecoration: 'none',
                color: isDark ? 'dodgerblue' : 'blue',
            }}
        >
            {buildingName}
        </Link>
    );
};

export default MapLink;
