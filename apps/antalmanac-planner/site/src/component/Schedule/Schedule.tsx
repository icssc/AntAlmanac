import { FC, useState, useEffect, useCallback } from 'react';
import './Schedule.scss';
import { Chip, LinearProgress, Tooltip } from '@mui/material';

import { WebsocAPIResponse, WebsocAPIResponse as WebsocResponse, WebsocSection as Section } from '@peterportal/types';
import { hourMinuteTo12HourString } from '../../helpers/util';
import { useAppSelector } from '../../store/hooks';
import trpc from '../../trpc';

import { MenuItem, Select } from '@mui/material';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import Toast, { ToastSeverity } from '../../helpers/toast';
import Link from 'next/link';
import { parseRestrictions } from '../../helpers/schedule';

interface ScheduleProps {
  courseID?: string;
  professorIDs?: string[];
  termsOffered?: string[];
}

interface ScheduleData {
  [key: string]: Section[];
}

const mergeWebsocAPIResponses = (responses: WebsocAPIResponse[]) => ({
  schools: responses.flatMap((response) => response.schools),
});

function getMeetingsString(section: Section) {
  const meetingStrings = section.meetings.map((meeting) => {
    if (meeting.timeIsTBA) return 'TBA';
    const { days, startTime, endTime } = meeting;
    const start = hourMinuteTo12HourString(startTime!);
    const end = hourMinuteTo12HourString(endTime!);
    return `${days} \n${start}-\n${end}`;
  });
  if (meetingStrings.length === 1) return meetingStrings[0];
  return meetingStrings.map((str) => str.replace(/\n/g, '')).join('\n');
}

const Schedule: FC<ScheduleProps> = (props) => {
  // For fetching data from API
  const [scheduleData, setScheduleData] = useState<ScheduleData>(null!);
  const currentQuarter = useAppSelector((state) => state.schedule.currentQuarter);
  const [selectedQuarter, setSelectedQuarter] = useState(props?.termsOffered ? props?.termsOffered[0] : currentQuarter);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<ToastSeverity>('success');

  const handleClose = () => {
    setShowToast(false);
  };
  const fetchScheduleDataFromAPI = useCallback(async () => {
    let apiResponse!: WebsocResponse;

    if (props.courseID) {
      const courseIDSplit = props.courseID.split(' ');
      const department = courseIDSplit.slice(0, courseIDSplit.length - 1).join(' ');
      const number = courseIDSplit[courseIDSplit.length - 1];

      apiResponse = await trpc.schedule.getTermDeptNum.query({ term: selectedQuarter, department, number });
    } else if (props.professorIDs) {
      apiResponse = await Promise.all(
        props.professorIDs.map((professor) => trpc.schedule.getTermProf.query({ term: selectedQuarter, professor })),
      ).then(mergeWebsocAPIResponses);
    }

    try {
      const data: ScheduleData = {};
      apiResponse.schools.forEach((school) => {
        school.departments.forEach((department) => {
          department.courses.forEach((course) => {
            data[department.deptCode + course.courseNumber] = course.sections;
          });
        });
      });
      setScheduleData(data);
    } catch (error) {
      // No school/department/course
      if (error instanceof TypeError) {
        setScheduleData({});
      }
    }
  }, [props.courseID, props.professorIDs, selectedQuarter]);

  useEffect(() => {
    if (selectedQuarter !== '') {
      fetchScheduleDataFromAPI();
    }
  }, [selectedQuarter, fetchScheduleDataFromAPI]);

  const renderData = (courseID: string, section: Section, index: number) => {
    if (!section.status) section.status = 'FULL';
    const currentlyEnrolled = parseInt(section.numCurrentlyEnrolled.totalEnrolled);
    const enrollmentPercent =
      parseInt(section.maxCapacity) == 0 ? 0 : (currentlyEnrolled * 100) / parseInt(section.maxCapacity);

    const clicktoCopy = (event: React.MouseEvent<HTMLElement>, sectionCode: string) => {
      event.stopPropagation();
      navigator.clipboard.writeText(sectionCode);
      setToastMsg('WebsocSection code copied to clipboard');
      setToastSeverity('success');
      setShowToast(true);
    };

    //This function returns the data for a dynamic table after accessing the API
    return (
      <tr key={index}>
        {props.professorIDs?.length && <td className="data-col">{courseID}</td>}
        <td className="data-col">
          <Tooltip title="Click to copy section code">
            <Chip
              label={section.sectionCode}
              onClick={(e) => {
                clicktoCopy(e, section.sectionCode);
              }}
            />
          </Tooltip>
        </td>
        <td className="data-col">{section.sectionType}</td>
        <td className="data-col">
          Sec: {section.sectionNum}
          <br />
          Units: {section.units}
        </td>
        <td className="data-col">{section.instructors.join('\n')}</td>
        <td className="data-col">{getMeetingsString(section)}</td>
        <td className="data-col">
          {section.meetings.map((meeting) => (meeting.timeIsTBA ? ['TBA'] : meeting.bldg)).join('\n')}
        </td>

        <td className="enrollment-col">
          <div className="capacity-text">
            <span className="enrollment-info-text">
              {currentlyEnrolled}/{section.maxCapacity}
            </span>
            <span className="enrollment-percentage">{Math.round(enrollmentPercent)}%</span>
          </div>
          <div className="progress-bar">
            <LinearProgress
              variant="determinate"
              value={Math.min(enrollmentPercent, 100)}
              data-status={section.status}
            />
          </div>
        </td>

        <td className="data-col">{section.numOnWaitlist}</td>
        <td className="data-col">
          <Tooltip title={parseRestrictions(section.restrictions)}>
            <Link
              href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
              rel="noopener noreferrer"
              target="_blank"
            >
              {section.restrictions}
            </Link>
          </Tooltip>
        </td>
        <td className="data-col">
          <div className="status-badge" data-status={section.status}>
            {section.status}
          </div>
        </td>
      </tr>
    );
  };

  if (!scheduleData) {
    return <p> Loading Schedule..</p>;
  } else {
    const sectionElements: JSX.Element[] = [];
    Object.keys(scheduleData).forEach((courseID) => {
      const sortedSections = [...scheduleData[courseID]].sort((a, b) => a.sectionCode.localeCompare(b.sectionCode));

      sortedSections.forEach((section, i) => {
        sectionElements.push(renderData(courseID, section, i));
      });
    });

    const termOptions =
      props.termsOffered?.map((term) => {
        return { text: term, value: term };
      }) ?? [];

    const isOffered = termOptions[0].text === currentQuarter;

    return (
      <div>
        {!isOffered && (
          <div className="offering-alert">
            <InfoOutlineIcon fontSize="small" />
            <p>
              <i>Not offered in {currentQuarter}.</i>
            </p>
          </div>
        )}
        <Toast text={toastMsg} severity={toastSeverity} showToast={showToast} onClose={handleClose} />

        {props.termsOffered ? (
          <Select
            value={selectedQuarter ?? currentQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            renderValue={() => {
              return selectedQuarter;
            }}
          >
            {termOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.text}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <div className="schedule-quarter">Showing results for {selectedQuarter}</div>
        )}
        <div className="table-wrapper">
          <table className="ppc-table schedule-table">
            <thead>
              <tr>
                {props.professorIDs?.length && <th>Course</th>}
                <th>Code</th>
                <th>Type</th>
                <th>Section</th>
                <th>Instructor</th>
                <th>Time</th>
                <th>Place</th>
                <th className="enrollment-col">Enrollment</th>
                <th>WL</th>
                <th>Rstr</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>{sectionElements}</tbody>
          </table>
        </div>
      </div>
    );
  }
};

export default Schedule;
