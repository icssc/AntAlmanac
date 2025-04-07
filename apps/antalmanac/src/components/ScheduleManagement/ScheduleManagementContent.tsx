import { lazy, Suspense } from 'react';

import darkModeLoadingGif from '../RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from '../RightPane/CoursePane/SearchForm/Gifs/loading.gif';

import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { AddedCoursePane } from '$components/RightPane/AddedCoursePane';
import { CoursePaneRoot } from '$components/RightPane/CoursePane/CoursePaneRoot';
import { useThemeStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';

const UCIMap = lazy(() => import('../Map/Map'));

export function ScheduleManagementContent() {
    const { activeTab } = useTabStore();
    const isDark = useThemeStore((store) => store.isDark);

    switch (activeTab) {
        case 0:
            return <ScheduleCalendar />;
        case 1:
            return <CoursePaneRoot />;
        case 2:
            return <AddedCoursePane />;
        case 3:
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
                            <img src={isDark ? darkModeLoadingGif : loadingGif} alt="Loading map" />
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
