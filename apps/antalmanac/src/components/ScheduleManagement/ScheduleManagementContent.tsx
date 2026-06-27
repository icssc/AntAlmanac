import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { AddedCoursesRoot } from '$components/RightPane/AddedCourses/AddedCoursesRoot';
import { CoursePaneRoot } from '$components/RightPane/CoursePane/CoursePaneRoot';
import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { useActiveTab } from '$lib/tabs/hooks';
import { unreachableCase } from '$lib/utils';
import Image from 'next/image';
import { lazy, Suspense } from 'react';

const UCIMap = lazy(() => import('$components/Map/Map').then((m) => ({ default: m.CourseMap })));

export function ScheduleManagementContent() {
    const activeTab = useActiveTab();
    const isDark = useIsDarkMode();

    switch (activeTab) {
        case 'calendar':
            return <ScheduleCalendar />;
        case 'search':
            return <CoursePaneRoot />;
        case 'added':
            return <AddedCoursesRoot />;
        case 'map':
            return (
                <Suspense
                    fallback={
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
                    }
                >
                    <UCIMap />
                </Suspense>
            );
        default: {
            unreachableCase(activeTab);
        }
    }
}
