import { AACourse, LarcAPIResponse, WebsocDepartment, WebsocSchool } from '@packages/antalmanac-types';

import RightPaneStore from '$components/RightPane/RightPaneStore';
import GeDataFetchProvider from '$components/RightPane/SectionTable/GEDataFetchProvider';
import { SchoolDeptCard } from '$components/RightPane/SectionTable/SchoolDeptCard';
import SectionTableLazyWrapper from '$components/RightPane/SectionTable/SectionTableLazyWrapper';
import analyticsEnum from '$lib/analytics';

interface SectionTableWrappedProps {
    index: number;
    scheduleNames: string[];
    courseData: (WebsocSchool | WebsocDepartment | AACourse)[];
    larcData: LarcAPIResponse | undefined;
}

/* TODO: all this typecasting in the conditionals is pretty messy, but type guards don't really work in this context
 *  for reasons that are currently beyond me (probably something in the transpiling process that JS doesn't like).
 *  If you can find a way to make this cleaner, do it.
 */
export function SectionTableWrapped({ index, scheduleNames, courseData, larcData }: SectionTableWrappedProps) {
    const formData = RightPaneStore.getFormData();

    if ((courseData[index] as WebsocSchool).departments !== undefined) {
        const school = courseData[index] as WebsocSchool;
        return <SchoolDeptCard name={school.schoolName} comment={school.schoolComment} type={'school'} />;
    }

    if ((courseData[index] as WebsocDepartment).courses !== undefined) {
        const dept = courseData[index] as WebsocDepartment;
        return <SchoolDeptCard name={`Department of ${dept.deptName}`} comment={dept.deptComment} type={'dept'} />;
    }

    if (formData.ge !== 'ANY') {
        const course = courseData[index] as AACourse;
        return (
            <GeDataFetchProvider
                term={formData.term}
                courseDetails={course}
                allowHighlight={true}
                scheduleNames={scheduleNames}
                analyticsCategory={analyticsEnum.classSearch.title}
            />
        );
    }

    const course = courseData[index] as AACourse;
    const larc = larcData?.courses.find(
        (larcCourse) => larcCourse.deptCode === course.deptCode && larcCourse.courseNumber === course.courseNumber
    );
    return (
        <SectionTableLazyWrapper
            term={formData.term}
            courseDetails={course}
            allowHighlight={true}
            scheduleNames={scheduleNames}
            analyticsCategory={analyticsEnum.classSearch.title}
            larcDetails={larc}
        />
    );
}
