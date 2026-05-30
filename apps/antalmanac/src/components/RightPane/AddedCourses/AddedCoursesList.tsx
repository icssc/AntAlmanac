import { SortableList } from '$components/drag-and-drop/SortableList';
import { EmptyState } from '$components/EmptyState';
import type { CourseWithTerm } from '$components/RightPane/AddedCourses/AddedCourses';
import { AddedCoursesLoadingSkeleton } from '$components/RightPane/AddedCourses/AddedCoursesLoadingSkeleton';
import { getMissingSections } from '$components/RightPane/AddedCourses/getMissingSections';
import SectionTable from '$components/RightPane/SectionTable/SectionTable';
import analyticsEnum from '$lib/analytics/analytics';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useTabStore } from '$stores/TabStore';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MenuBook } from '@mui/icons-material';
import { memo } from 'react';

interface AddedCoursesListProps {
    courses: CourseWithTerm[];
    scheduleNames: string[];
    onCourseOrderChange: (updatedCourses: CourseWithTerm[], activeIndex: number, overIndex: number) => void;
}

export const AddedCoursesList = memo(({ courses, scheduleNames, onCourseOrderChange }: AddedCoursesListProps) => {
    const openLoadingSchedule = useScheduleComponentsToggleStore((state) => state.openLoadingSchedule);
    const setActiveTab = useTabStore((state) => state.setActiveTab);
    const setOpenImportDialog = useScheduleComponentsToggleStore((state) => state.setOpenImportDialog);

    if (courses.length === 0) {
        return (
            <EmptyState
                Icon={MenuBook}
                title="No Courses Added Yet"
                description="Search for courses and add sections to build your schedule. You can also import from your study list."
                primaryAction={{
                    label: 'Search Courses',
                    onClick: () => setActiveTab('search'),
                }}
                secondaryAction={{
                    label: 'Import Schedule',
                    onClick: () => setOpenImportDialog(true),
                }}
            />
        );
    }

    if (openLoadingSchedule) {
        return <AddedCoursesLoadingSkeleton />;
    }

    return (
        <SortableList
            disableHorizontalScroll
            items={courses}
            onChange={onCourseOrderChange}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            sortingStrategy={verticalListSortingStrategy}
            renderItem={(course: CourseWithTerm) => {
                const missingSections = getMissingSections(course);

                return (
                    <SortableList.Item id={course.id}>
                        <SectionTable
                            sortable
                            courseDetails={course}
                            term={course.term}
                            allowHighlight={false}
                            analyticsCategory={analyticsEnum.addedClasses}
                            scheduleNames={scheduleNames}
                            missingSections={missingSections}
                        />
                    </SortableList.Item>
                );
            }}
        />
    );
});

AddedCoursesList.displayName = 'AddedCoursesList';
