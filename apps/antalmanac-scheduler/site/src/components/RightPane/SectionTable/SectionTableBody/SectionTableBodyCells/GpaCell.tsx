import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { GradesPopover } from '$components/RightPane/SectionTable/SectionTablePopover/GradesPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import { getInstructorGradesFromSection, useSectionGrades } from '$stores/CourseGradesStore';
import { ButtonBase, Popover } from '@mui/material';
import type { AACourseWithTerm, AASection } from '@packages/antalmanac-types';
import { useCallback, useMemo, useState } from 'react';

interface GpaCellProps {
    section: AASection;
    course: AACourseWithTerm;
}

export const GpaCell = ({ section, course }: GpaCellProps) => {
    const { deptCode, courseNumber } = course;
    const isMobile = useIsMobile();
    const [anchorEl, setAnchorEl] = useState<Element>();

    const { overallGrades, areOverallGradesLoading, sectionInstructorGrades, areSectionInstructorGradesLoading } =
        useSectionGrades(section.sectionCode);

    const { instructorGpa, instructor } = useMemo(() => {
        if (!sectionInstructorGrades) {
            return { instructorGpa: '', instructor: '' };
        }
        const { instructor, instructorGrades } = getInstructorGradesFromSection(sectionInstructorGrades);
        return {
            instructorGpa:
                typeof instructorGrades?.averageGPA === 'number' ? instructorGrades.averageGPA.toFixed(2) : '',
            instructor,
        };
    }, [sectionInstructorGrades]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl((current) => (current ? undefined : event.currentTarget));
    }, []);

    const hideDistribution = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    let gpa = null;
    if (!areSectionInstructorGradesLoading) {
        gpa = instructorGpa;
    }
    if (!gpa && !areOverallGradesLoading) {
        gpa = overallGrades?.averageGPA?.toFixed(2);
    }

    return (
        <TableBodyCellContainer>
            <ButtonBase
                sx={{
                    fontFamily: 'inherit',
                    fontSize: 'unset',
                    color: (theme) => theme.vars.palette.secondary.main,
                    fontWeight: 700,
                }}
                onClick={handleClick}
            >
                {areSectionInstructorGradesLoading ? null : gpa || 'GPA'}
            </ButtonBase>

            <Popover
                open={Boolean(anchorEl)}
                onClose={hideDistribution}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <GradesPopover
                    deptCode={deptCode}
                    courseNumber={courseNumber}
                    sectionCode={section.sectionCode}
                    instructor={instructor}
                    isMobile={isMobile}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
