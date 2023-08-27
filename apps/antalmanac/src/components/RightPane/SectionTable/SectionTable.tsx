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

interface TableHeaderColumnDetails {
    label: string;
    width: string;
}

const tableHeaderColumns: Record<SectionTableColumn, TableHeaderColumnDetails> = {
    sectionCode: {
        label: 'Code',
        width: '8%',
    },
    sectionDetails: {
        label: 'Type',
        width: '8%',
    },
    instructors: {
        label: 'Instructors',
        width: '8%',
    },
    gpa: {
        label: 'GPA',
        width: '15%',
    },
    dayAndTime: {
        label: 'Times',
        width: '12%',
    },
    location: {
        label: 'Places',
        width: '10%',
    },
    sectionEnrollment: {
        label: 'Enrollment',
        width: '10%',
    },
    restrictions: {
        label: 'Restr',
        width: '8%',
    },
    status: {
        label: 'Status',
        width: '8%',
    },
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
        return (width * numColumns) / SECTION_TABLE_COLUMNS.length;
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

            <TableContainer component={Paper} sx={{ margin: '8px 0px 8px 0px' }} elevation={0} variant="outlined">
                <Table size="small" sx={{ minWidth: `${tableMinWidth}px` }}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="none" />
                            {tableHeaderColumnEntries
                                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                                .map(([column, { label, width }]) => (
                                    <TableCell key={column} padding="none" width={width} sx={{ paddingX: 0.5 }}>
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
