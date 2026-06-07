import { ActionCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/ActionCell';
import { DayAndTimeCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/DayAndTimeCell';
import { DetailsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/DetailsCell';
import { EnrollmentCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/EnrollmentCell';
import { GpaCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/GpaCell';
import { InstructorsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/InstructorsCell';
import { LocationsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/LocationsCell';
import { RestrictionsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/RestrictionsCell';
import { SectionCodeCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/SectionCodeCell';
import { StatusCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/StatusCell';
import { SyllabusCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/SyllabusCell';
import { AnalyticsCategory } from '$lib/analytics/analytics';
import { unreachableCase } from '$lib/utils';
import type { SectionTableColumn } from '$stores/ColumnStore';
import { AACourseWithTerm, AASection } from '@packages/antalmanac-types';

interface SectionTableBodyRowCellProps {
    column: SectionTableColumn;
    section: AASection;
    course: AACourseWithTerm;
    addedCourse: boolean;
    scheduleConflict: boolean;
    scheduleNames: string[];
    analyticsCategory: AnalyticsCategory;
}

export function SectionTableBodyRowCell({
    column,
    section,
    course,
    addedCourse,
    scheduleConflict,
    scheduleNames,
    analyticsCategory,
}: SectionTableBodyRowCellProps) {
    switch (column) {
        case 'action':
            return (
                <ActionCell
                    section={section}
                    course={course}
                    scheduleConflict={scheduleConflict}
                    addedCourse={addedCourse}
                    scheduleNames={scheduleNames}
                />
            );
        case 'sectionCode':
            return <SectionCodeCell sectionCode={section.sectionCode} analyticsCategory={analyticsCategory} />;
        case 'sectionDetails':
            return (
                <DetailsCell
                    sectionType={section.sectionType}
                    sectionNum={section.sectionNum}
                    units={parseFloat(section.units)}
                />
            );
        case 'instructors':
            return <InstructorsCell instructors={section.instructors} />;
        case 'gpa':
            return (
                <GpaCell
                    deptCode={course.deptCode}
                    courseNumber={course.courseNumber}
                    instructors={section.instructors}
                />
            );
        case 'dayAndTime':
            return <DayAndTimeCell meetings={section.meetings} />;
        case 'location':
            return <LocationsCell meetings={section.meetings} />;
        case 'sectionEnrollment':
            return (
                <EnrollmentCell
                    sectionType={section.sectionType}
                    deptCode={course.deptCode}
                    courseNumber={course.courseNumber}
                    term={course.term}
                    sectionCode={section.sectionCode}
                    numCurrentlyEnrolled={section.numCurrentlyEnrolled}
                    maxCapacity={parseInt(section.maxCapacity, 10)}
                    numOnWaitlist={section.numOnWaitlist}
                    numWaitlistCap={section.numWaitlistCap}
                    numNewOnlyReserved={section.numNewOnlyReserved}
                    updatedAt={section.updatedAt}
                />
            );
        case 'status':
            return <StatusCell status={section.status} />;
        case 'restrictions':
            return <RestrictionsCell restrictions={section.restrictions} />;
        case 'syllabus':
            return <SyllabusCell webURL={section.webURL} />;
        default:
            unreachableCase(column);
    }
}
