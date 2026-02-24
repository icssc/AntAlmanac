import { useTabStore } from "$stores/TabStore";
import { useCallback } from "react";
import { Link } from "react-router-dom";

interface MapLinkProps {
    buildingId: number;
    room: string;
}

export const MapLink = ({ buildingId, room }: MapLinkProps) => {
    const { setActiveTab } = useTabStore();

    const focusMap = useCallback(() => {
        setActiveTab("map");
    }, [setActiveTab]);

    return (
        <Link
            to={`/map?location=${buildingId}`}
            onClick={focusMap}
            style={{
                textDecoration: "none",
            }}
        >
            {room}
        </Link>
    );
};
