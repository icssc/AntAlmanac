import { useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Assessment, Assignment, Help, RateReview } from '@material-ui/icons';
import ShowChartIcon from '@material-ui/icons/ShowChart';

// import AlmanacGraph from '../EnrollmentGraph/EnrollmentGraph'; uncomment when we get past enrollment data back and restore the files (https://github.com/icssc/AntAlmanac/tree/5e89e035e66f00608042871d43730ba785f756b0/src/components/RightPane/SectionTable/EnrollmentGraph)
import CourseInfoBar from './CourseInfoBar';
import CourseInfoButton from './CourseInfoButton';
import GradesPopup from './GradesPopup';
import { SectionTableProps } from './SectionTable.types';
import SectionsGrid from './SectionsGrid';
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
    row: {
        '&:nth-child(1)': {
            width: '8%',
        },
        '&:nth-child(2)': {
            width: '8%',
        },
        '&:nth-child(3)': {
            width: '8%',
        },
        '&:nth-child(4)': {
            width: '15%',
        },
        '&:nth-child(5)': {
            width: '12%',
        },
        '&:nth-child(6)': {
            width: '10%',
        },
        '&:nth-child(7)': {
            width: '10%',
        },
        '&:nth-child(8)': {
            width: '8%',
        },
        '&:nth-child(9)': {
            width: '8%',
        },
    },
};

const SectionTable = (props: SectionTableProps) => {
    const { classes, courseDetails, term, colorAndDelete, highlightAdded, scheduleNames, analyticsCategory } = props;
    const courseId = courseDetails.deptCode.replaceAll(' ', '') + courseDetails.courseNumber;
    const encodedDept = encodeURIComponent(courseDetails.deptCode);
    const isMobileScreen = useMediaQuery('(max-width: 750px)');

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
                    analyticsCategory={analyticsCategory}
                />

                {/* Temporarily remove "Past Enrollment" until data on PeterPortal API */}
                {/* <AlmanacGraph courseDetails={courseDetails} />  */}

                {courseDetails.prerequisiteLink && (
                    <CourseInfoButton
                        analyticsCategory={analyticsCategory}
                        analyticsAction={analyticsEnum.classSearch.actions.CLICK_PREREQUISITES}
                        text={isMobileScreen ? 'Prereqs' : 'Prerequisites'}
                        icon={<Assignment />}
                        redirectLink={courseDetails.prerequisiteLink}
                    />
                )}
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

            <SectionsGrid courseDetails={courseDetails} term={term} scheduleNames={scheduleNames} />
        </>
    );
};

export default withStyles(styles)(SectionTable);
