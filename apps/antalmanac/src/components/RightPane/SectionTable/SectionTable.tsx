import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { Assessment, Help, RateReview, ShowChart as ShowChartIcon } from '@material-ui/icons';
import { MOBILE_BREAKPOINT } from '../../../globals';
import RightPaneStore, { SECTION_TABLE_COLUMNS, type SectionTableColumn } from '../RightPaneStore';
import CourseInfoBar from './CourseInfoBar';
import CourseInfoButton from './CourseInfoButton';
import GradesPopup from './GradesPopup';
import { SectionTableProps } from './SectionTable.types';
import SectionTableBody from './SectionTableBody';
import analyticsEnum from '$lib/analytics';

// import AlmanacGraph from '../EnrollmentGraph/EnrollmentGraph'; uncomment when we get past enrollment data back and restore the files (https://github.com/icssc/AntAlmanac/tree/5e89e035e66f00608042871d43730ba785f756b0/src/components/RightPane/SectionTable/EnrollmentGraph)

const tableHeaderColumns: Record<SectionTableColumn, string> = {
    sectionCode: 'Code',
    sectionDetails: 'Type',
    instructors: 'Instructors',
    gpa: 'GPA',
    dayAndTime: 'Times',
    location: 'Places',
    sectionEnrollment: 'Enrollment',
    restrictions: 'Restr',
    status: 'Status',
};

const tableHeaderColumnEntries = Object.entries(tableHeaderColumns);

interface EnrollmentColumnHeaderProps {
    label: string;
}

function EnrollmentColumnHeader(props: EnrollmentColumnHeaderProps) {
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

    return (
        <Box display="flex">
            <Typography>{props.label}</Typography>
            {!isMobileScreen && (
                <Tooltip
                    title={
                        <Typography>
                            Enrolled/Capacity
                            <br />
                            Waitlist
                            <br />
                            New-Only Reserved
                        </Typography>
                    }
                >
                    <Help fontSize="small" />
                </Tooltip>
            )}
        </Box>
    );
}

function SectionTable(props: SectionTableProps) {
    const { courseDetails, term, allowHighlight, scheduleNames, analyticsCategory } = props;

    const [activeColumns, setActiveColumns] = useState(RightPaneStore.getActiveColumns());

    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

    const courseId = useMemo(() => {
        return courseDetails.deptCode.replaceAll(' ', '') + courseDetails.courseNumber;
    }, [courseDetails.deptCode, courseDetails.courseNumber]);

    const encodedDept = useMemo(() => {
        return encodeURIComponent(courseDetails.deptCode);
    }, [courseDetails.deptCode]);

    /**
     * Limit table width to force side scrolling.
     */
    const tableMinWidth = useMemo(() => {
        const width = isMobileScreen ? 600 : 780;
        const numColumns = RightPaneStore.getActiveColumns().length;
        return width / numColumns / SECTION_TABLE_COLUMNS.length;
    }, [isMobileScreen]);

    const handleColumnChange = useCallback(
        (newActiveColumns: SectionTableColumn[]) => {
            setActiveColumns(newActiveColumns);
        },
        [setActiveColumns]
    );

    useEffect(() => {
        RightPaneStore.on('columnChange', handleColumnChange);

        return () => {
            RightPaneStore.removeListener('columnChange', handleColumnChange);
        };
    }, [handleColumnChange]);

    return (
        <>
            <Box display="inline-flex" gap={0.5} marginTop={0.5}>
                <CourseInfoBar
                    deptCode={courseDetails.deptCode}
                    courseTitle={courseDetails.courseTitle}
                    courseNumber={courseDetails.courseNumber}
                    prerequisiteLink={courseDetails.prerequisiteLink}
                    analyticsCategory={analyticsCategory}
                />

                {/* Temporarily remove "Past Enrollment" until data on PeterPortal API */}
                {/* <AlmanacGraph courseDetails={courseDetails} />  */}

                <CourseInfoButton
                    analyticsCategory={analyticsCategory}
                    analyticsAction={analyticsEnum.classSearch.actions.CLICK_REVIEWS}
                    text="Reviews"
                    icon={<RateReview />}
                    redirectLink={`https://peterportal.org/course/${courseId}`}
                />

                <CourseInfoButton
                    analyticsCategory={analyticsCategory}
                    analyticsAction={analyticsEnum.classSearch.actions.CLICK_ZOTISTICS}
                    text="Zotistics"
                    icon={<Assessment />}
                    popupContent={
                        <GradesPopup
                            deptCode={courseDetails.deptCode}
                            courseNumber={courseDetails.courseNumber}
                            isMobileScreen={isMobileScreen}
                        />
                    }
                />

                <CourseInfoButton
                    analyticsCategory={analyticsCategory}
                    analyticsAction={analyticsEnum.classSearch.actions.CLICK_PAST_ENROLLMENT}
                    text="Past Enrollment"
                    icon={<ShowChartIcon />}
                    redirectLink={`https://zot-tracker.herokuapp.com/?dept=${encodedDept}&number=${courseDetails.courseNumber}&courseType=all`}
                />
            </Box>

            <TableContainer component={Paper} style={{ margin: '8px 0px 8px 0px' }} elevation={0} variant="outlined">
                <Table size="small" style={{ minWidth: `${tableMinWidth}px` }}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="none" />
                            {tableHeaderColumnEntries
                                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                                .map(([column, label]) => (
                                    <TableCell padding="none" key={column}>
                                        {label === 'Enrollment' ? <EnrollmentColumnHeader label={label} /> : label}
                                    </TableCell>
                                ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {courseDetails.sections.map((section) => {
                            return (
                                <SectionTableBody
                                    key={section.sectionCode}
                                    section={section}
                                    courseDetails={courseDetails}
                                    term={term}
                                    allowHighlight={allowHighlight}
                                    scheduleNames={scheduleNames}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default SectionTable;
