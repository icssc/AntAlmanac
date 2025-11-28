import { AACourse, WebsocDepartment, WebsocSchool } from '@packages/antalmanac-types';

import RightPaneStore from '$components/RightPane/RightPaneStore';
import GeDataFetchProvider from '$components/RightPane/SectionTable/GEDataFetchProvider';
import { SchoolDeptCard } from '$components/RightPane/SectionTable/SchoolDeptCard';
import SectionTableLazyWrapper from '$components/RightPane/SectionTable/SectionTableLazyWrapper';
import analyticsEnum from '$lib/analytics/analytics';

interface SectionTableWrappedProps {
    index: number;
    scheduleNames: string[];
    courseData: (WebsocSchool | WebsocDepartment | AACourse)[];
}

/* TODO: all this typecasting in the conditionals is pretty messy, but type guards don't really work in this context
 *  for reasons that are currently beyond me (probably something in the transpiling process that JS doesn't like).
 *  If you can find a way to make this cleaner, do it.
 */
export function SectionTableWrapped({ index, scheduleNames, courseData }: SectionTableWrappedProps) {
    const formData = RightPaneStore.getFormData();

    let component;

    if ((courseData[index] as WebsocSchool).departments !== undefined) {
        const school = courseData[index] as WebsocSchool;
        component = <SchoolDeptCard comment={school.schoolComment} type={'school'} name={school.schoolName} />;
    } else if ((courseData[index] as WebsocDepartment).courses !== undefined) {
        const dept = courseData[index] as WebsocDepartment;
        component = <SchoolDeptCard name={`Department of ${dept.deptName}`} comment={dept.deptComment} type={'dept'} />;
    } else if (formData.ge !== 'ANY') {
        const course = courseData[index] as AACourse;
        component = (
            <GeDataFetchProvider
                term={formData.term}
                courseDetails={course}
                allowHighlight={true}
                scheduleNames={scheduleNames}
                analyticsCategory={analyticsEnum.classSearch}
            />
        );
    } else {
        const course = courseData[index] as AACourse;
        component = (
            <SectionTableLazyWrapper
                term={formData.term}
                courseDetails={course}
                allowHighlight={true}
                scheduleNames={scheduleNames}
                analyticsCategory={analyticsEnum.classSearch}
            />
        );
    }

    return <div>{component}</div>;
}
