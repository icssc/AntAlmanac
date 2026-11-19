import './SavedCourses.scss';
import { useEffect } from 'react';
import { useMemo } from 'react';

import LoadingSpinner from '../../../component/LoadingSpinner/LoadingSpinner';
import { useSavedCourses } from '../../../hooks/savedCourses';
import { useTakenCourseSet } from '../../../hooks/useTakenCourseSet';
import { useAppDispatch } from '../../../store/hooks';
import { setGroupExpanded } from '../../../store/slices/courseRequirementsSlice';
import { DepartmentCourseGroup } from './ProgramRequirementsList';

const SavedCourseList = () => {
    const resultsLoading = false;
    const { savedCourses } = useSavedCourses();
    const dispatch = useAppDispatch();
    const takenCourseSet = useTakenCourseSet();

    const groupedByDepartment = useMemo(() => {
        const groups: Record<string, string[]> = {};
        savedCourses.forEach((course) => {
            const deptString = `${course.departmentName} (${course.department})`;
            groups[deptString] ??= [];
            groups[deptString].push(course.id);
        });
        return groups;
    }, [savedCourses]);

    useEffect(() => {
        Object.keys(groupedByDepartment).forEach((deptString) => {
            dispatch(setGroupExpanded({ storeKey: 'saved-' + deptString, expanded: true }));
        });
    }, [dispatch, groupedByDepartment]);

    if (resultsLoading) return <LoadingSpinner />;

    const deptGroups = Object.entries(groupedByDepartment).map(([deptString, courses]) => {
        return (
            <DepartmentCourseGroup
                key={deptString}
                department={deptString}
                courses={courses}
                takenCourseIDs={takenCourseSet}
                storeKey={'saved-' + deptString}
            ></DepartmentCourseGroup>
        );
    });

    return <div className="saved-courses department-course-groups">{deptGroups}</div>;
};

export default SavedCourseList;
