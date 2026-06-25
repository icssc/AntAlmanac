import { ActionCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/ActionCell';
import { CourseCodeCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/CourseCodeCell';
import { DayAndTimeCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/DayAndTimeCell';
import { DetailsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/DetailsCell';
import { EnrollmentCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/EnrollmentCell';
import { GpaCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/GpaCell';
import { InstructorsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/InstructorsCell';
import { LocationsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/LocationsCell';
import { RestrictionsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/RestrictionsCell';
import { StatusCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/StatusCell';
import { SyllabusCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/SyllabusCell';
import { type AnalyticsCategory } from '$lib/analytics/analytics';
import { unreachableCase } from '$lib/utils';
import type { SectionTableColumn } from '$stores/ColumnStore';
import { type AACourseWithTerm, type AASection } from '@packages/antalmanac-types';

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
            return <CourseCodeCell sectionCode={section.sectionCode} analyticsCategory={analyticsCategory} />;
        case 'sectionDetails':
            return <DetailsCell section={section} />;
        case 'instructors':
            return <InstructorsCell section={section} />;
        case 'gpa':
            return <GpaCell section={section} course={course} />;
        case 'dayAndTime':
            return <DayAndTimeCell section={section} />;
        case 'location':
            return <LocationsCell section={section} />;
        case 'sectionEnrollment':
            return <EnrollmentCell section={section} course={course} />;
        case 'status':
            return <StatusCell section={section} />;
        case 'restrictions':
            return <RestrictionsCell section={section} />;
        case 'syllabus':
            return <SyllabusCell section={section} />;
        default:
            unreachableCase(column);
    }
}
