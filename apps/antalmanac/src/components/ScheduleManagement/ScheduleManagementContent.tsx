import { ScheduleCalendar } from "$components/Calendar/CalendarRoot";
import { AddedCoursePane } from "$components/RightPane/AddedCourses/AddedCoursePane";
import { CoursePaneRoot } from "$components/RightPane/CoursePane/CoursePaneRoot";
import { useThemeStore } from "$stores/SettingsStore";
import { useTabStore } from "$stores/TabStore";
import Image from "next/image";
import { Suspense, lazy } from "react";

import darkModeLoadingGif from "../RightPane/CoursePane/SearchForm/Gifs/dark-loading.gif";
import loadingGif from "../RightPane/CoursePane/SearchForm/Gifs/loading.gif";

const UCIMap = lazy(() => import("../Map/Map"));

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
                                height: "100%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Image
                                src={isDark ? darkModeLoadingGif : loadingGif}
                                alt="Loading map"
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
