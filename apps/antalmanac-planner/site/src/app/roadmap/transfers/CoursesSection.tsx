import { FC, useState, useEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import MenuSection, { SectionDescription } from './MenuSection';
import MenuTile from './MenuTile';
import trpc from '../../../trpc';
import { TransferredCourse, CourseAAPIResponse } from '@peterportal/types';
import {
  addTransferredCourse,
  removeTransferredCourse,
  updateTransferredCourse,
  TransferWithUnread,
} from '../../../store/slices/transferCreditsSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getCourseIdWithSpaces } from '../../../helpers/util';
import { useIsLoggedIn } from '../../../hooks/isLoggedIn';

interface CourseSelectOption {
  value: TransferredCourse;
  label: string;
}

const CourseCreditMenuTile: FC<{ course: TransferWithUnread<TransferredCourse> }> = ({ course }) => {
  const { courseName, units, unread } = course;
  const dispatch = useAppDispatch();
  const isLoggedIn = useIsLoggedIn();

  const deleteFn = () => {
    dispatch(removeTransferredCourse(courseName));
    if (!isLoggedIn) return;
    trpc.transferCredits.removeTransferredCourse.mutate(courseName);
  };
  const setUnits = (value: number) => {
    const updatedCourse: TransferredCourse = { courseName, units: value };
    dispatch(updateTransferredCourse(updatedCourse));
    if (!isLoggedIn) return;
    trpc.transferCredits.updateTransferredCourse.mutate(updatedCourse);
  };

  return (
    <>
      <MenuTile title={courseName} units={units} setUnits={setUnits} deleteFn={deleteFn} unread={unread} />
    </>
  );
};

const CoursesSection: FC = () => {
  const courses = useAppSelector((state) => state.transferCredits.transferredCourses);
  const [options, setOptions] = useState<CourseSelectOption[]>([]);
  const [courseSearchValue, setCourseSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    if (!courseSearchValue.trim()) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const abortController = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const response = await trpc.search.get.query(
          {
            query: courseSearchValue,
            skip: 0,
            take: 10,
            resultType: 'course',
          },
          { signal: abortController.signal },
        );
        const courses = response.results.map((c) => c.result) as CourseAAPIResponse[];
        const newOptions: CourseSelectOption[] = courses.map((c) => ({
          value: { courseName: getCourseIdWithSpaces(c), units: c.maxUnits },
          label: `${getCourseIdWithSpaces(c)}: ${c.title}`,
        }));

        if (!abortController.signal.aborted) {
          setOptions(newOptions);
          setLoading(false);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setOptions([]);
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      abortController.abort();
    };
  }, [courseSearchValue]);

  const addCourse = (course: TransferredCourse) => {
    dispatch(addTransferredCourse(course));
    if (!isLoggedIn) return;
    trpc.transferCredits.addTransferredCourse.mutate(course);
  };

  return (
    <MenuSection title="Courses Taken">
      <SectionDescription>
        Enter courses you&rsquo;ve claimed credit for through a{' '}
        <a href="https://testingcenter.uci.edu/" target="_blank" rel="noreferrer">
          credit by exam
        </a>{' '}
        or{' '}
        <a href="https://assist.org" target="_blank" rel="noreferrer">
          through another college
        </a>
        .
      </SectionDescription>

      {courses.map((course) => (
        <CourseCreditMenuTile key={course.courseName} course={course} />
      ))}

      <Autocomplete
        className="course-search-select"
        options={options}
        filterOptions={(option) => option} // disable built-in filtering to show all options from the server
        value={null}
        inputValue={courseSearchValue}
        open={courseSearchValue.length > 0 && (options.length > 0 || loading)}
        onInputChange={(_event, newInputValue) => {
          setCourseSearchValue(newInputValue);
        }}
        onChange={(_event, option) => {
          if (option) {
            addCourse(option.value);
            setCourseSearchValue('');
            setOptions([]);
          }
        }}
        getOptionLabel={(option) => option.label}
        loading={loading}
        noOptionsText={courseSearchValue ? 'No courses found' : ''}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" size="small" placeholder="Search for a course to add..." />
        )}
      />
    </MenuSection>
  );
};

export default CoursesSection;
