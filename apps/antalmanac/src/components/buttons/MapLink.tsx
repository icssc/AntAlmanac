import { Link } from '@mui/material';
import NextLink from 'next/link';

interface MapLinkProps {
    buildingId: number;
    room: string;
}

export const MapLink = ({ buildingId, room }: MapLinkProps) => {
    return (
        <Link component={NextLink} href={`/map?location=${buildingId}`} underline="hover">
            {room}
        </Link>
    );
};
