import { SortableList } from '$components/drag-and-drop/SortableList';
import { EmptyState } from '$components/EmptyState';
import { AddedCoursesLoadingSkeleton } from '$components/RightPane/AddedCourses/AddedCoursesLoadingSkeleton';
import { SectionTable } from '$components/RightPane/SectionTable/SectionTable';
import analyticsEnum from '$lib/analytics/analytics';
import { getMissingSections } from '$lib/courseAlerts';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { scheduleOfferingKey } from '$stores/scheduleHelpers';
import { useTabStore } from '$stores/TabStore';
import { verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MenuBook } from '@mui/icons-material';
import { type AACourseWithTerm } from '@packages/antalmanac-types';
import { memo } from 'react';

const getOfferingId = (course: AACourseWithTerm) => scheduleOfferingKey(course);

interface AddedCoursesListProps {
    courses: AACourseWithTerm[];
    scheduleNames: string[];
    onCourseOrderChange: (updatedCourses: AACourseWithTerm[], activeIndex: number, overIndex: number) => void;
}

export const AddedCoursesList = memo(({ courses, scheduleNames, onCourseOrderChange }: AddedCoursesListProps) => {
    const openLoadingSchedule = useScheduleComponentsToggleStore((state) => state.openLoadingSchedule);
    const setActiveTab = useTabStore((state) => state.setActiveTab);
    const setOpenImportDialog = useScheduleComponentsToggleStore((state) => state.setOpenImportDialog);

    if (openLoadingSchedule) {
        return <AddedCoursesLoadingSkeleton />;
    }

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

    return (
        <SortableList
            disableHorizontalScroll
            items={courses}
            getItemId={getOfferingId}
            onChange={onCourseOrderChange}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            sortingStrategy={verticalListSortingStrategy}
            renderItem={(course) => {
                return (
                    <SortableList.Item id={getOfferingId(course)}>
                        <SectionTable
                            sortable
                            course={course}
                            allowHighlight={false}
                            analyticsCategory={analyticsEnum.addedClasses}
                            scheduleNames={scheduleNames}
                            missingSections={getMissingSections(course)}
                        />
                    </SortableList.Item>
                );
            }}
        />
    );
});

AddedCoursesList.displayName = 'AddedCoursesList';
