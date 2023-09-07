import {
    Box,
    Paper,
    Table,
    TableCell,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Assessment, Help, RateReview } from '@material-ui/icons';
import ShowChartIcon from '@material-ui/icons/ShowChart';
// import AlmanacGraph from '../EnrollmentGraph/EnrollmentGraph'; uncomment when we get past enrollment data back and restore the files (https://github.com/icssc/AntAlmanac/tree/5e89e035e66f00608042871d43730ba785f756b0/src/components/RightPane/SectionTable/EnrollmentGraph)
import { useCallback, useEffect, useState } from 'react';
import { MOBILE_BREAKPOINT } from '../../../globals';
import RightPaneStore, { SECTION_TABLE_COLUMNS, type SectionTableColumn } from '../RightPaneStore';
import CourseInfoBar from './CourseInfoBar';
import CourseInfoButton from './CourseInfoButton';
import GradesPopup from './GradesPopup';
import { SectionTableProps } from './SectionTable.types';
import SectionTableBody from './SectionTableBody';
import analyticsEnum from '$lib/analytics';

const styles = {
    flex: {
        display: 'flex',
        alignItems: 'center',
    },
    iconMargin: {
        marginRight: '4px',
    },
    cellPadding: {
        padding: '0px 0px 0px 0px',
    },
    row: {},
    container: {},
    titleRow: {},
    clearSchedule: {},
    scheduleNoteContainer: {},
};

interface TableHeaderColumnDetails {
    label: string;
    width?: string;
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
        width: '15%',
    },
    gpa: {
        label: 'GPA',
        width: '7%',
    },
    dayAndTime: {
        label: 'Times',
        width: '10%',
    },
    location: {
        label: 'Places',
        width: '10%',
    },
    sectionEnrollment: {
        label: 'Enrollment',
        width: '9%',
    },
    restrictions: {
        label: 'Restr',
        width: '10%',
    },
    status: {
        label: 'Status',
        width: '8%',
    },
};

interface EnrollmentColumnHeaderProps {
    label: string;
    width?: string;
}

function EnrollmentColumnHeader(props: EnrollmentColumnHeaderProps) {
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

    return (
        <Box display="flex" width={props.width} paddingRight="5px">
            {props.label}
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
                    <Help fontSize="inherit" />
                </Tooltip>
            )}
        </Box>
    );
}

const SectionTable = (props: SectionTableProps) => {
    const { classes, courseDetails, term, allowHighlight, scheduleNames, analyticsCategory } = props;
    const courseId = courseDetails.deptCode.replaceAll(' ', '') + courseDetails.courseNumber;
    const encodedDept = encodeURIComponent(courseDetails.deptCode);
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

    const [activeColumns, setActiveColumns] = useState(RightPaneStore.getActiveColumns());

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

    // Limit table width to force side scrolling
    const tableMinWidth =
        ((isMobileScreen ? 600 : 780) * RightPaneStore.getActiveColumns().length) / SECTION_TABLE_COLUMNS.length;

    return (
        <>
            <div
                style={{
                    display: 'inline-flex',
                    gap: '4px',
                    marginTop: '4px',
                }}
            >
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
            </div>

            <TableContainer component={Paper} style={{ margin: '8px 0px 8px 0px' }} elevation={0} variant="outlined">
                <Table className={classes?.table} size="small" style={{ minWidth: `${tableMinWidth}px` }}>
                    <TableHead>
                        <TableRow className={classes?.row}>
                            <TableCell classes={{ sizeSmall: classes?.cellPadding }} />
                            {Object.entries(tableHeaderColumns)
                                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                                .map(([column, { label, width }]) => (
                                    <TableCell key={column} padding="none" width={width}>
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
};

export default withStyles(styles)(SectionTable);
