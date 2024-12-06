import { Button, Popover, useMediaQuery } from '@material-ui/core';
import { useState, useCallback, useEffect } from 'react';

import { MOBILE_BREAKPOINT } from '../../../../../src/globals';

import GradesPopup from '$components/RightPane/SectionTable/GradesPopup';
import { SectionTableCell } from '$components/RightPane/SectionTable/cells/section-table-cell';
import { Grades } from '$lib/grades';
import { useThemeStore } from '$stores/SettingsStore';

async function getGpaData(deptCode: string, courseNumber: string, instructors: string[]) {
    const namedInstructors = instructors.filter((instructor) => instructor !== 'STAFF');

    // Get the GPA of the first instructor of this section where data exists
    for (const instructor of namedInstructors) {
        const grades = await Grades.queryGrades(deptCode, courseNumber, instructor, false);
        if (grades?.averageGPA) {
            return {
                gpa: grades.averageGPA.toFixed(2).toString(),
                instructor: instructor,
            };
        }
    }

    return undefined;
}

interface SectionGPACellProps {
    deptCode: string;
    courseNumber: string;
    instructors: string[];
}

export function SectionGPACell(props: SectionGPACellProps) {
    const isDark = useThemeStore((store) => store.isDark);

    const { deptCode, courseNumber, instructors } = props;

    const [gpa, setGpa] = useState('');

    const [instructor, setInstructor] = useState('');

    const [anchorEl, setAnchorEl] = useState<Element>();

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl((currentAnchorEl) => (currentAnchorEl ? undefined : event.currentTarget));
    }, []);

    const hideDistribution = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    useEffect(() => {
        getGpaData(deptCode, courseNumber, instructors)
            .then((data) => {
                if (data) {
                    setGpa(data.gpa);
                    setInstructor(data.instructor);
                }
            })
            .catch(console.log);
    }, [deptCode, courseNumber, instructors]);

    return (
        <SectionTableCell>
            <Button
                style={{
                    color: isDark ? 'dodgerblue' : 'blue',
                    padding: 0,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: '1rem',
                }}
                onClick={handleClick}
                variant="text"
            >
                {gpa}
            </Button>
            <Popover
                open={Boolean(anchorEl)}
                onClose={hideDistribution}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                disableRestoreFocus
            >
                <GradesPopup
                    deptCode={deptCode}
                    courseNumber={courseNumber}
                    instructor={instructor}
                    isMobileScreen={useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`)}
                />
            </Popover>
        </SectionTableCell>
    );
}
