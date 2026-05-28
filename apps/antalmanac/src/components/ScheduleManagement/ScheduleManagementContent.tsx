import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { AddedCoursePane } from '$components/RightPane/AddedCourses/AddedCoursePane';
import { CoursePaneRoot } from '$components/RightPane/CoursePane/CoursePaneRoot';
import { useThemeStore } from '$stores/SettingsStore';
import { TAB_INDEX, useTabStore } from '$stores/TabStore';
import Image from 'next/image';
import { lazy, Suspense } from 'react';

const UCIMap = lazy(() => import('../Map/Map'));

export function ScheduleManagementContent() {
    const activeTab = useTabStore((store) => store.activeTab);
    const isDark = useThemeStore((store) => store.isDark);

    switch (activeTab) {
        case TAB_INDEX.calendar:
            return <ScheduleCalendar />;
        case TAB_INDEX.search:
            return <CoursePaneRoot />;
        case TAB_INDEX.added:
            return <AddedCoursePane />;
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
