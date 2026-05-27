import { useFriendScheduleTab } from '$lib/schedule/FriendScheduleTabContext';
import { useScheduleViewSource } from '$lib/schedule/ScheduleViewContext';
import { useTabStore } from '$stores/TabStore';
import { useCallback, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';

interface MapLinkProps {
    buildingId: number;
    room: string;
}

const linkStyle = { textDecoration: 'none' } as const;

export const MapLink = ({ buildingId, room }: MapLinkProps) => {
    const scheduleSource = useScheduleViewSource();
    const friendScheduleTab = useFriendScheduleTab();
    const setActiveTab = useTabStore((store) => store.setActiveTab);

    const isFriendMap = scheduleSource.scope === 'friend' && friendScheduleTab != null;

    const handleFriendMapClick = useCallback(
        (e: MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            friendScheduleTab?.focusMapLocation(buildingId);
        },
        [buildingId, friendScheduleTab]
    );

    const handleHomeMapClick = useCallback(() => {
        setActiveTab('map');
    }, [setActiveTab]);

    if (isFriendMap) {
        return (
            <a href="#" onClick={handleFriendMapClick} style={linkStyle}>
                {room}
            </a>
        );
    }

    return (
        <Link to={`/map?location=${buildingId}`} onClick={handleHomeMapClick} style={linkStyle}>
            {room}
        </Link>
    );
};
