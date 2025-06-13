import { Assessment, ShowChart as ShowChartIcon } from '@mui/icons-material';
import { Box, Paper, Table, TableCell, TableContainer, TableHead, TableRow, useMediaQuery } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import PeterPortalIcon from '$assets/peterportal-logo.png';
import { CourseInfoBar } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoBar';
import { CourseInfoButton } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoButton';
import { CourseInfoSearchButton } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoSearchButton';
import { EnrollmentColumnHeader } from '$components/RightPane/SectionTable/EnrollmentColumnHeader';
import { EnrollmentHistoryPopup } from '$components/RightPane/SectionTable/EnrollmentHistoryPopup';
import GradesPopup from '$components/RightPane/SectionTable/GradesPopup';
import { SectionTableProps } from '$components/RightPane/SectionTable/SectionTable.types';
import { SectionTableBody } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBody';
import analyticsEnum from '$lib/analytics/analytics';
import { MOBILE_BREAKPOINT } from '$src/globals';
import { useColumnStore, SECTION_TABLE_COLUMNS, type SectionTableColumn } from '$stores/ColumnStore';
import { useTabStore } from '$stores/TabStore';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { StatusColumnHeader } from './StatusColumnHeader';

const TOTAL_NUM_COLUMNS = SECTION_TABLE_COLUMNS.length;

interface TableHeaderColumnDetails {
    label: string;
    width?: string;
}

const tableHeaderColumns: Record<Exclude<SectionTableColumn, 'action'>, TableHeaderColumnDetails> = {
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
        width: '5%',
    },
    dayAndTime: {
        label: 'Times',
        width: '15%',
    },
    location: {
        label: 'Places',
        width: '8%',
    },
    sectionEnrollment: {
        label: 'Enrollment',
        width: '9%',
    },
    restrictions: {
        label: 'Restr',
        width: '8%',
    },
    status: {
        label: 'Status',
        width: '8%',
    },
    syllabus: {
        label: 'Syllabus',
        width: '8%',
    },
};
const tableHeaderColumnEntries = Object.entries(tableHeaderColumns);

function SectionTable(props: SectionTableProps) {
    const { courseDetails, term, allowHighlight, scheduleNames, analyticsCategory } = props;

    const [activeColumns] = useColumnStore((store) => [store.activeColumns]);
    const [activeTab] = useTabStore((store) => [store.activeTab]);
    const { isMilitaryTime } = useTimeFormatStore()
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);
    const isCompact = useMediaQuery('(max-width:750px)');

    const courseId = useMemo(() => {
        return courseDetails.deptCode.replaceAll(' ', '') + courseDetails.courseNumber;
    }, [courseDetails.deptCode, courseDetails.courseNumber]);

    const formattedTime = useMemo(() => {
        const raw = courseDetails.updatedAt ?? '';
        const parsed = Date.parse(raw);
        if (isNaN(parsed)) return null;

        return new Date(parsed).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !isMilitaryTime,
        });
    }, [courseDetails.updatedAt, isMilitaryTime]);

    /**
     * Limit table width to force side scrolling.
     */
    const width = 780;
    const tableMinWidth = useMemo(() => {
        const numActiveColumns = activeColumns.length;
        return (width * numActiveColumns) / TOTAL_NUM_COLUMNS;
    }, [activeColumns]);

    /**
     * Store the size for the custom PeterPortal icon.
     */
    const customIconSize = 18;

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '8px',
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

                {activeTab !== 2 ? null : <CourseInfoSearchButton courseDetails={courseDetails} term={term} />}

                <CourseInfoButton
                    analyticsCategory={analyticsCategory}
                    analyticsAction={analyticsEnum.classSearch.actions.CLICK_REVIEWS}
                    text="PeterPortal"
                    icon={
                        <img
                            src={PeterPortalIcon}
                            alt="PeterPortal Icon"
                            width={customIconSize}
                            height={customIconSize}
                        />
                    }
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
                    popupContent={
                        <EnrollmentHistoryPopup
                            department={courseDetails.deptCode}
                            courseNumber={courseDetails.courseNumber}
                        />
                    }
                />
            </Box>
    
            <TableContainer
                component={Paper}
                sx={{ margin: '8px 0px 8px 0px', width: '100%' }}
                elevation={0}
                variant="outlined"
            >
                <Table
                    size="small"
                    sx={{
                        minWidth: `${tableMinWidth}px`,
                        width: '100%',
                        tableLayout: 'fixed',
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    padding: 0,
                                    width: isMobileScreen ? '6%' : '8%',
                                }}
                            />
                            {tableHeaderColumnEntries
                                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                                .map(([column, { label, width }]) => (
                                    <TableCell
                                        key={column}
                                        sx={{
                                            width: width,
                                            padding: 0,
                                        }}
                                    >
                                        {label === 'Status' ? <StatusColumnHeader label={label} formattedTime={formattedTime}/> : label}
                                    </TableCell>
                                ))}
                        </TableRow>
                    </TableHead>
    
                    <SectionTableBody
                        courseDetails={courseDetails}
                        term={term}
                        allowHighlight={allowHighlight}
                        scheduleNames={scheduleNames}
                        analyticsCategory={analyticsCategory}
                    />
                </Table>
            </TableContainer>
        </>
    );    
}

export default SectionTable;
