import Link from 'next/link';

interface MapLinkProps {
    buildingId: number;
    room: string;
}

export const MapLink = ({ buildingId, room }: MapLinkProps) => {
    return (
        <Link
            href={`/map?location=${buildingId}`}
            style={{
                textDecoration: 'none',
            }}
        >
            {room}
        </Link>
    );
};
