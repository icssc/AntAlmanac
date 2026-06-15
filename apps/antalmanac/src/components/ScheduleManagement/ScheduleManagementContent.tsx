import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { AddedCoursesRoot } from '$components/RightPane/AddedCourses/AddedCoursesRoot';
import { CoursePaneRoot } from '$components/RightPane/CoursePane/CoursePaneRoot';
import { useActiveTabIndex } from '$lib/tabs/hooks';
import { TAB_INDEX } from '$lib/tabs/tabs';
import { useThemeStore } from '$stores/SettingsStore';
import Image from 'next/image';
import { lazy, Suspense } from 'react';

const UCIMap = lazy(() => import('$components/Map/Map').then((m) => ({ default: m.CourseMap })));

export function ScheduleManagementContent() {
    const activeTab = useActiveTabIndex();
    const isDark = useThemeStore((store) => store.isDark);

    switch (activeTab) {
        case TAB_INDEX.calendar:
            return <ScheduleCalendar />;
        case TAB_INDEX.search:
            return <CoursePaneRoot />;
        case TAB_INDEX.added:
            return <AddedCoursesRoot />;
        case TAB_INDEX.map:
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

        default:
            return null;
    }
}
