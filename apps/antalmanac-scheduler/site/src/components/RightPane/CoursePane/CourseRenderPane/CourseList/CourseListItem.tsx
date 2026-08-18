import { CourseListSchoolDeptCard } from '$components/RightPane/CoursePane/CourseRenderPane/CourseList/CourseListSchoolDeptCard';
import {
    type CourseListEntry,
    isDepartmentEntry,
    isSchoolEntry,
} from '$components/RightPane/CoursePane/CourseRenderPane/CourseList/helpers';
import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';
import { GeDataFetchProvider } from '$components/RightPane/SectionTable/GEDataFetchProvider';
import { SectionTable } from '$components/RightPane/SectionTable/SectionTable';
import analyticsEnum from '$lib/analytics/analytics';

interface CourseListItemProps {
    item: CourseListEntry;
    scheduleNames: string[];
    formData: CourseSearchParams;
}

export function CourseListItem({ item, scheduleNames, formData }: CourseListItemProps) {
    return (
        <div>
            {isSchoolEntry(item) ? (
                <CourseListSchoolDeptCard name={item.schoolName} comment={item.schoolComment} type={'school'} />
            ) : isDepartmentEntry(item) ? (
                <CourseListSchoolDeptCard
                    name={`Department of ${item.deptName}`}
                    comment={item.deptComment}
                    type={'dept'}
                />
            ) : formData.ge !== 'ANY' ? (
                <GeDataFetchProvider
                    course={item}
                    allowHighlight={true}
                    scheduleNames={scheduleNames}
                    analyticsCategory={analyticsEnum.classSearch}
                />
            ) : (
                <SectionTable
                    course={item}
                    allowHighlight={true}
                    scheduleNames={scheduleNames}
                    analyticsCategory={analyticsEnum.classSearch}
                />
            )}
        </div>
    );
}
