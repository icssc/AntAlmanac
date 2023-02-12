import { useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, IconButton, Link, Popover, Skeleton, Typography, useMediaQuery } from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  InfoOutlined as InfoOutlinedIcon,
  RateReview as RateReviewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { PETERPORTAL_REST_ENDPOINT, PETERPORTAL_GRAPHQL_ENDPOINT } from '$lib/endpoints';
import { useSearchStore } from '$stores/search';
import type { WebsocResponse, School, Department, AACourse, AASection, CourseResponse } from '$types/peterportal';
import useWebsocQuery from '$hooks/useQueryWebsoc';
import { useSettingsStore } from '$stores/settings';
import { useScheduleStore } from '$stores/schedule';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import SchoolCard from './SchoolCard';
import DeptCard from './DeptCard';
import SectionTable from './SectionTable';

ChartJS.register(...registerables);

type AnyThing = School | Department | AACourse;

function flattenSOCObject(SOCObject: WebsocResponse) {
  const courseColors = useScheduleStore
    .getState()
    .currentCourses()
    .reduce((accumulator, { section }) => {
      accumulator[section.sectionCode] = section.color;
      return accumulator;
    }, {} as { [key: string]: string });
  const reduced = SOCObject.schools.reduce((accumulator, school) => {
    accumulator.push(school);
    school.departments.forEach((dept) => {
      accumulator.push(dept);
      dept.courses.forEach((course) => {
        for (const section of course.sections) {
          (section as AASection).color = courseColors[section.sectionCode];
        }
        accumulator.push(course as AACourse);
      });
    });
    return accumulator;
  }, [] as AnyThing[]);
  return reduced;
}

export default function CourseList() {
  const { getParams, showResults, setShowResults } = useSearchStore();

  function handleRefresh() {
    query.refetch();
  }

  function handleBack() {
    setShowResults(false);
  }

  /**
   * when the store's value changes, getParams triggers a new query
   */
  const query = useWebsocQuery(getParams(), {
    enabled: showResults,
  });

  const rawData = query.data;
  const transformedData = rawData ? flattenSOCObject(rawData) : [];

  return (
    <Box>
      <IconButton onClick={handleBack}>
        <ArrowBackIcon />
      </IconButton>
      <IconButton onClick={handleRefresh}>
        <RefreshIcon />
      </IconButton>
      {transformedData.map((data, index) => (
        <DoSomething key={index} course={data} />
      ))}
    </Box>
  );
}

function DoSomething(props: { course: AnyThing }) {
  const { course: info } = props;
  /**
   * info is a School
   */
  if ('departments' in info) {
    return <SchoolCard name={info.schoolName} comment={info.schoolComment} />;
  }

  /**
   * info is a Department
   */
  if ('courses' in info) {
    return <DeptCard name={`Department of ${info.deptName}`} comment={info.deptComment} />;
  }

  /**
   * info is AACourse
   */
  if ('courseNumber' in info) {
    const courseId = info.deptCode.replaceAll(' ', '') + info.courseNumber;
    return (
      <Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', margin: 1 }}>
          <CourseInfoButton course={info} />
          {info.prerequisiteLink && (
            <CourseInfoButton2
              analyticsAction={analyticsEnum.classSearch.actions.CLICK_PREREQUISITES}
              title="Prerequisites"
              icon={<AssignmentIcon />}
              href={info.prerequisiteLink}
            />
          )}
          <CourseInfoButton2
            analyticsAction={analyticsEnum.classSearch.actions.CLICK_PREREQUISITES}
            title="Reviews"
            icon={<RateReviewIcon />}
            href={`https://peterportal.org/course/${courseId}`}
          />
          <CourseInfoButton2
            analyticsAction={analyticsEnum.classSearch.actions.CLICK_ZOTISTICS}
            title="Zotistics"
            icon={<AssessmentIcon />}
          >
            <GradesPopup course={info} />
          </CourseInfoButton2>
        </Box>
        <SectionTable course={info} />
      </Box>
    );
  }

  return <Box>Error!</Box>;
}

const noCourseInfo = {
  title: 'No description available',
  prerequisite_text: '',
  prerequisite_for: '',
  description: '',
  ge_list: '',
};

function CourseInfoButton(props: { course: AACourse }) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { course } = props;
  const courseId = encodeURIComponent(`${course.deptCode.replace(/\s/g, '')}${course.courseNumber.replace(/\s/g, '')}`);
  const query = useQuery([PETERPORTAL_REST_ENDPOINT, courseId], {
    async queryFn() {
      const response = await fetch(`${PETERPORTAL_REST_ENDPOINT}/courses/${courseId}`);
      if (response.ok) {
        const jsonResp = (await response.json()) as CourseResponse;
        const courseInfo = {
          title: jsonResp.title,
          prerequisite_text: jsonResp.prerequisite_text,
          prerequisite_for: jsonResp.prerequisite_for.join(', '),
          description: jsonResp.description,
          ge_list: jsonResp.ge_list.join(', '),
        };
        return courseInfo;
      } else {
        return noCourseInfo;
      }
    },
  });

  return (
    <>
      <Button
        onClick={handleClick}
        variant="contained"
        startIcon={<InfoOutlinedIcon />}
      >{`${course?.deptCode} ${course?.courseNumber} | ${course?.courseTitle}`}</Button>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ maxWidth: 500, padding: 4 }}>
          <Typography fontWeight="bold">{query.data?.title}</Typography>
          <br />
          <Typography variant="body2">{query.data?.description}</Typography>
          {query.data?.prerequisite_text && (
            <>
              <br />
              <Typography variant="body2">Prerequisites: {query.data?.prerequisite_text}</Typography>
            </>
          )}
          {query.data?.prerequisite_for && (
            <>
              <br />
              <Typography variant="body2">Prerequisite for: {query.data?.prerequisite_for}</Typography>
            </>
          )}
          {query.data?.ge_list && (
            <>
              <br />
              <Typography variant="body2"> General Education Categories: {query.data?.ge_list}</Typography>
            </>
          )}
        </Box>
      </Popover>
    </>
  );
}

interface CourseInfoButtonProps {
  title: string;
  icon: React.ReactElement;
  analyticsAction: string;
  href?: string;
  children?: React.ReactElement;
}

function CourseInfoButton2(props: CourseInfoButtonProps) {
  const { title, icon, href, children, analyticsAction } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    logAnalytics({
      category: analyticsEnum.classSearch.title,
      action: analyticsAction,
    });

    if (href) {
      window.open(href);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="contained" onClick={handleClick} startIcon={icon}>
        {title}
      </Button>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {children}
      </Popover>
    </>
  );
}

interface GradesGraphQLResponse {
  data: {
    courseGrades: {
      aggregate: {
        average_gpa: number;
        sum_grade_a_count: number;
        sum_grade_b_count: number;
        sum_grade_c_count: number;
        sum_grade_d_count: number;
        sum_grade_f_count: number;
        sum_grade_np_count: number;
        sum_grade_p_count: number;
      };
    };
  };
}

function GradesPopup(props: { course: AACourse }) {
  const isMobileScreen = useMediaQuery('(max-width: 750px)');
  const { isDarkMode } = useSettingsStore();
  const { course } = props;
  const queryString = `
      { courseGrades: grades(department: "${course.deptCode}", number: "${course.courseNumber}", ) {
          aggregate {
            sum_grade_a_count
            sum_grade_b_count
            sum_grade_c_count
            sum_grade_d_count
            sum_grade_f_count
            sum_grade_p_count
            sum_grade_np_count
            average_gpa
          }
      },
    }`;

  const query = useQuery([], {
    async queryFn() {
      const query = JSON.stringify({
        query: queryString,
      });

      const res = (await fetch(`${PETERPORTAL_GRAPHQL_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: query,
      }).then((res) => res.json())) as GradesGraphQLResponse;
      const grades = res.data.courseGrades.aggregate;
      const datasets = Object.entries(grades)
        .filter(([key]) => key !== 'average_gpa')
        .map(([, value]) => value);
      return {
        datasets,
        grades,
      };
    },
  });

  const encodedDept = encodeURIComponent(course.deptCode);
  const color = isDarkMode() ? '#fff' : '#111';
  const title = `Grade Distribution | Average GPA: ${query.data?.grades?.average_gpa}`;
  const width = isMobileScreen ? 300 : 500;
  const height = isMobileScreen ? 200 : 300;

  const data: ChartData<'bar', number[] | undefined, string> = {
    labels: ['A', 'B', 'C', 'D', 'E', 'F', 'P', 'NP'],
    datasets: [
      {
        data: query.data?.datasets || [],
        backgroundColor: '#5182ed',
      },
    ],
  };

  /**
   * @see {@link https://www.chartjs.org/docs/latest/configuration/} for general
   * @see {@link https://www.chartjs.org/docs/latest/configuration/title.html} for title
   * @see {@link https://www.chartjs.org/docs/latest/axes/styling.html} for styling x and y axes
   */
  const options: ChartOptions<'bar'> = {
    animation: {
      duration: 0,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color,
        font: {
          size: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color,
        },
        ticks: {
          color,
        },
        title: {
          display: true,
          text: 'Grade',
          color,
        },
      },
      y: {
        grid: {
          color,
        },
        ticks: {
          color,
        },
      },
    },
  };

  return (
    <Box sx={{ padding: 2 }}>
      {!query.data ? (
        <Skeleton variant="text" animation="wave" height={height} width={width}></Skeleton>
      ) : (
        <Box>
          <Box height={height} width={width}>
            <Bar data={data} height={height} width={width} options={options} />
          </Box>
          <Box textAlign="center">
            <Link
              href={`https://zotistics.com/?&selectQuarter=&selectYear=&selectDep=${encodedDept}&classNum=${course.courseNumber}&code=&submit=Submit`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Zotistics
            </Link>
          </Box>
        </Box>
      )}
    </Box>
  );
}
