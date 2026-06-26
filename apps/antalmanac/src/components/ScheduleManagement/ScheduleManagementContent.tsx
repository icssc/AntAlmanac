import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { AddedCoursesRoot } from '$components/RightPane/AddedCourses/AddedCoursesRoot';
import { CoursePaneRoot } from '$components/RightPane/CoursePane/CoursePaneRoot';
import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { useActiveTab } from '$lib/tabs/hooks';
import { unreachableCase } from '$lib/utils';
import dynamic from 'next/dynamic';
import Image from 'next/image';

function MapLoadingFallback() {
    const isDark = useIsDarkMode();
    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Image
                src={isDark ? '/course-search/dark-loading.gif' : '/course-search/loading.gif'}
                alt="Loading map"
                width={370}
                height={220}
                unoptimized
            />
        </div>
    );
}

const UCIMap = dynamic(() => import('$components/Map/Map').then((m) => ({ default: m.CourseMap })), {
    ssr: false,
    loading: MapLoadingFallback,
});

export function ScheduleManagementContent() {
    const activeTab = useActiveTab();

    switch (activeTab) {
        case 'calendar':
            return <ScheduleCalendar />;
        case 'search':
            return <CoursePaneRoot />;
        case 'added':
            return <AddedCoursesRoot />;
        case 'map':
            return <UCIMap />;
        default: {
            unreachableCase(activeTab);
        }
    }
}
