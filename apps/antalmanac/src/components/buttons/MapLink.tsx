import { Link } from 'react-router-dom';

interface MapLinkProps {
    buildingId: number;
    room: string;
}

export const MapLink = ({ buildingId, room }: MapLinkProps) => {
    return (
        <Link
            to={`/map?location=${buildingId}`}
            style={{
                textDecoration: 'none',
            }}
        >
            {room}
        </Link>
    );
};
