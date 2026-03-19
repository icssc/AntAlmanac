import './SavedCourses.scss';
import { ProgramRequirement } from '@peterportal/types';
import LoadingSpinner from '../../../component/LoadingSpinner/LoadingSpinner';
import { useSavedCourses } from '../../../hooks/savedCourses';
import ProgramRequirementsList from './ProgramRequirementsList';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { useEffect } from 'react';
import { setGroupExpanded } from '../../../store/slices/courseRequirementsSlice';
import { useAppDispatch } from '../../../store/hooks';

const NoSavedCourses = () => {
  return (
    <>
      <h4>No Saved Courses!</h4>
      <p>
        You have no saved courses yet! When you click the <BookmarkBorderIcon /> button from the course info tooltip or
        course preview page, it will show up here!
      </p>
    </>
  );
};

const SavedCourseList = () => {
  const resultsLoading = false;
  const { savedCourses } = useSavedCourses();
  const dispatch = useAppDispatch();

  const groupedByDepartment: Record<string, string[]> = {};
  savedCourses.forEach((course) => {
    const deptString = `${course.departmentName} (${course.department})`;
    groupedByDepartment[deptString] ??= [];
    groupedByDepartment[deptString].push(course.id);
  });

  /**
   * @todo currently, consecutive "single-course" "requirements" are grouped into a single
   * "complete all of the following block". this requires #840 to be merged to fix.
   */
  const requirements = Object.entries(groupedByDepartment).map(([deptString, courses]) => {
    const requirement: ProgramRequirement = {
      requirementType: 'Course',
      label: deptString,
      courseCount: courses.length + 1,
      requirementId: '',
      courses,
    };
    return requirement;
  });

  useEffect(() => {
    requirements.forEach((_, i) => {
      dispatch(setGroupExpanded({ storeKey: 'saved-' + i, expanded: true }));
    });
  }, [dispatch, requirements]);

  if (resultsLoading) return <LoadingSpinner />;
  if (!savedCourses.length) return <NoSavedCourses />;

  return (
    <div className="saved-courses">
      <ProgramRequirementsList requirements={requirements} storeKeyPrefix="saved" skipCollapseSingletons />
    </div>
  );
};

export default SavedCourseList;
