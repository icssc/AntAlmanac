import './SavedCourses.scss';
import LoadingSpinner from '$planner/component/LoadingSpinner/LoadingSpinner';
import { useSavedCourses } from '$planner/hooks/savedCourses';
import { useAppDispatch } from '$planner/store/hooks';
import { setGroupExpanded } from '$planner/store/slices/courseRequirementsSlice';
import { type ProgramRequirement } from '@packages/planner-types';
import { useEffect } from 'react';

import ProgramRequirementsList from './ProgramRequirementsList';

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

    return (
        <div className="saved-courses">
            <ProgramRequirementsList requirements={requirements} storeKeyPrefix="saved" skipCollapseSingletons />
        </div>
    );
};

export default SavedCourseList;
