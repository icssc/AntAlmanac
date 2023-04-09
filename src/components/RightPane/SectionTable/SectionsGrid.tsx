// noinspection DuplicatedCode

import { withStyles } from '@material-ui/core/styles';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Fragment, useEffect, useState } from 'react';
import { Button, Popover, TableCell, Tooltip, Typography, useMediaQuery } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { AACourse, AASection, EnrollmentCount, Meeting } from '$lib/peterportal.types';
import { ColorAndDelete, ScheduleAddCell } from '$components/RightPane/SectionTable/SectionTableButtons';
import AppStore from '$stores/AppStore';
import { clickToCopy } from '$lib/helpers';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import RightPaneStore from '$components/RightPane/RightPaneStore';

const styles = {
    // Add styles here
};

interface OptionsCellProps {
    section: AASection;
    courseDetails: AACourse;
    term: string;
    scheduleNames: string[];
}

const OptionsCell = (props: OptionsCellProps) => {
    const { section, courseDetails, term, scheduleNames } = props;

    // Checks whether the section is added to current schedule
    const getSectionAdded = () => AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term}`);

    const [sectionAdded, setSectionAdded] = useState(getSectionAdded());

    // Should only run on mount
    useEffect(() => {
        function updateSectionAdded() {
            // Check whether the section is added to current schedule every time the schedule changes
            setSectionAdded(getSectionAdded());
        }

        AppStore.on('addedCoursesChange', updateSectionAdded);
        AppStore.on('currentScheduleIndexChange', updateSectionAdded);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateSectionAdded);
            AppStore.removeListener('currentScheduleIndexChange', updateSectionAdded);
        };
    });

    return sectionAdded ? (
        <ColorAndDelete color={section.color} sectionCode={section.sectionCode} term={term} />
    ) : (
        <ScheduleAddCell section={section} courseDetails={courseDetails} term={term} scheduleNames={scheduleNames} />
    );
};

interface CodeCellProps {
    // TODO: Style
    // // classes: ClassNameMap;
    sectionCode: string;
}

const CodeCell = withStyles(styles)((props: CodeCellProps) => {
    const { sectionCode } = props;

    return (
        <Tooltip title="Click to copy course code" placement="bottom" enterDelay={300}>
            <Button
                size="small"
                onClick={(event) => {
                    clickToCopy(event, sectionCode);
                    logAnalytics({
                        category: analyticsEnum.classSearch.title,
                        action: analyticsEnum.classSearch.actions.COPY_COURSE_CODE,
                    });
                }}
                // className={classes.sectionCode} // TODO
            >
                {sectionCode}
            </Button>
        </Tooltip>
    );
});

type SectionType = 'Act' | 'Col' | 'Dis' | 'Fld' | 'Lab' | 'Lec' | 'Qiz' | 'Res' | 'Sem' | 'Stu' | 'Tap' | 'Tut';

interface TypeCellProps {
    // // classes: ClassNameMap; TODO
    sectionType: SectionType;
    sectionNum: string;
    units: number;
}

const TypeCell = withStyles(styles)((props: TypeCellProps) => {
    const { sectionType, sectionNum, units } = props;
    const isMobileScreen = useMediaQuery('(max-width: 750px)');

    return (
        <div
        // classname={} TODO
        >
            <div
            // className={classes[sectionType]} TODO
            >
                {sectionType}
            </div>
            <div>
                {!isMobileScreen && <>Sec: </>}
                {sectionNum}
            </div>
            <div>
                {!isMobileScreen && <>Units: </>}
                {units}
            </div>
        </div>
    );
});

interface InstructorsCellProps {
    // classes: ClassNameMap; TODO
    instructors: string[];
}

const InstructorsCell = withStyles(styles)((props: InstructorsCellProps) => {
    const { instructors } = props;

    const getLinks = (professorNames: string[]) => {
        return professorNames.map((profName) => {
            if (profName !== 'STAFF') {
                const lastName = profName.substring(0, profName.indexOf(','));
                return (
                    <div key={profName}>
                        <a
                            href={`https://www.ratemyprofessors.com/search/teachers?sid=U2Nob29sLTEwNzQ=&query=${lastName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {profName}
                        </a>
                    </div>
                );
            } else {
                return profName;
            }
        });
    };

    return <div>{getLinks(instructors)}</div>;
});

const TimesCell = withStyles(styles)((props: { meetings: Meeting[] }) => {
    const { meetings } = props;

    return (
        <div
        // className={classes.cell}
        >
            {meetings.map((meeting) => {
                const timeString = meeting.time.replace(/\s/g, '').split('-').join(' - ');
                return <div key={meeting.days + meeting.time + meeting.bldg}>{`${meeting.days} ${timeString}`}</div>;
            })}
        </div>
    );
});

interface PlacesCellProps {
    meetings: Meeting[];
    courseName: string; // Used in map pin popup
}

const PlacesCell = withStyles(styles)((props: PlacesCellProps) => {
    const { meetings, courseName } = props;

    return (
        <div
        // className={classes.cell}
        >
            {meetings.map((meeting) => {
                return meeting.bldg !== 'TBA' ? (
                    <Fragment key={meeting.days + meeting.time + meeting.bldg}>
                        <button
                            // className={classes.mapLink}
                            onClick={() => {
                                RightPaneStore.focusOnBuilding({
                                    location: meeting.bldg,
                                    courseName: courseName,
                                });
                            }}
                        >
                            {meeting.bldg}
                        </button>
                        <br />
                    </Fragment>
                ) : (
                    <div>{meeting.bldg}</div>
                );
            })}
        </div>
    );
});

interface EnrollmentCellProps {
    numCurrentlyEnrolled: EnrollmentCount;
    maxCapacity: number;
    /** This is a string because sometimes it's "n/a" */
    numOnWaitlist: string;
    /** This is a string because numOnWaitlist is a string. I haven't seen this be "n/a" but it seems possible and I don't want it to break if that happens. */
    numNewOnlyReserved: string;
}

const EnrollmentCell = withStyles(styles)((props: EnrollmentCellProps) => {
    const { numCurrentlyEnrolled, maxCapacity, numOnWaitlist, numNewOnlyReserved } = props;

    return (
        <div
        // className={classes.cell}
        >
            <div>
                <strong>
                    {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
                </strong>
            </div>
            {numOnWaitlist !== '' && <div>WL: {numOnWaitlist}</div>}
            {numNewOnlyReserved !== '' && <div>NOR: {numNewOnlyReserved}</div>}
        </div>
    );
});

const RstrCell = withStyles(styles)((props: { restrictions: string }) => {
    // TODO: Add tooltip, linking, and styling
    const { restrictions } = props;

    return <div>{restrictions}</div>;
});

const StatusCell = withStyles(styles)((props: { status: string }) => {
    const { status } = props;

    return <div>{status}</div>;
});

interface SectionsGridProps {
    classes: ClassNameMap;
    courseDetails: AACourse;
    term: string;
    scheduleNames: string[];
}

// Interface for row data that's passed to the grid
// Names correlate to the field names of the columns, not internal datatype names
interface SectionsGridRow {
    id: string;
    options: OptionsCellProps;
    code: CodeCellProps;
    type: TypeCellProps;
    instructors: InstructorsCellProps;
    times: { meetings: Meeting[] };
    places: PlacesCellProps;
    enrollment: EnrollmentCellProps;
    rstr: { restrictions: string };
    status: { status: string };
}

export const SectionsGrid = withStyles(styles)((props: SectionsGridProps) => {
    const { courseDetails, term, scheduleNames } = props; // NOTE: courseDetails is NOT of class CourseDetails

    const renderOptionsCell = (params: GridRenderCellParams<OptionsCellProps>) => <OptionsCell {...params.value} />;

    const renderCodeCell = (params: GridRenderCellParams<CodeCellProps>) => <CodeCell {...params.value} />;

    const renderTypeCell = (params: GridRenderCellParams<TypeCellProps>) => <TypeCell {...params.value} />;

    const renderInstructorsCell = (params: GridRenderCellParams<InstructorsCellProps>) => {
        return <InstructorsCell {...params.value} />;
    };

    const renderTimesCell = (params: GridRenderCellParams<{ meetings: Meeting[] }>) => <TimesCell {...params.value} />;

    const renderPlacesCell = (params: GridRenderCellParams<PlacesCellProps>) => <PlacesCell {...params.value} />;

    const renderEnrollmentCell = (params: GridRenderCellParams<EnrollmentCellProps>) => (
        <EnrollmentCell {...params.value} />
    );

    const renderRstrCell = (params: GridRenderCellParams<{ restrictions: string }>) => <RstrCell {...params.value} />;

    const renderStatusCell = (params: GridRenderCellParams<{ status: string }>) => <StatusCell {...params.value} />;

    // How cells of each column are rendered
    // renderCell is a function that returns a ReactNode which replaces the default cell rendering
    const columns: GridColDef[] = [
        { field: 'options', headerName: '', sortable: false, renderCell: renderOptionsCell },
        { field: 'code', headerName: 'Code', renderCell: renderCodeCell },
        { field: 'type', headerName: 'Type', renderCell: renderTypeCell },
        { field: 'instructors', headerName: 'Instructors', renderCell: renderInstructorsCell },
        { field: 'times', headerName: 'Times', renderCell: renderTimesCell },
        { field: 'places', headerName: 'Places', renderCell: renderPlacesCell },
        { field: 'enrollment', headerName: 'Enrollment', renderCell: renderEnrollmentCell },
        { field: 'rstr', headerName: 'Rstr', renderCell: renderRstrCell },
        { field: 'status', headerName: 'Status', renderCell: renderStatusCell },
    ];

    // Data of the section table
    const rows: SectionsGridRow[] = courseDetails.sections.map((section) => ({
        id: section.sectionCode,
        options: {
            section,
            courseDetails,
            term,
            scheduleNames,
        },
        code: {
            sectionCode: section.sectionCode,
        },
        type: {
            sectionType: section.sectionType as SectionType,
            sectionNum: section.sectionNum,
            units: Number(section.units),
        },
        instructors: {
            instructors: section.instructors,
        },
        times: { meetings: section.meetings },
        places: {
            meetings: section.meetings,
            courseName: courseDetails.courseTitle,
        },
        enrollment: {
            numCurrentlyEnrolled: section.numCurrentlyEnrolled,
            maxCapacity: Number(section.maxCapacity),
            numOnWaitlist: section.numOnWaitlist,
            numNewOnlyReserved: section.numNewOnlyReserved,
        },
        rstr: { restrictions: section.restrictions }, // TODO
        status: { status: section.status },
    }));

    return (
        <div style={{ width: '100%' }}>
            <DataGrid rows={rows} columns={columns} hideFooter autoHeight={true} />
        </div>
    );
});

export default SectionsGrid;
