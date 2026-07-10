import './Library.scss';
import ClickableDiv from '$planner/component/ClickableDiv/ClickableDiv';
import { ExpandMore } from '$planner/component/ExpandMore/ExpandMore';
import { customCourseSortable } from '$planner/helpers/sortable';
import { deepCopy } from '$planner/helpers/util';
import { useIsLoggedIn } from '$planner/hooks/isLoggedIn';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import { addCustomCourse, updateCustomCourse } from '$planner/store/slices/customCourseSlice';
import { setActiveCustomCourse, updateRoadmapCustomCourse } from '$planner/store/slices/roadmapSlice';
import trpc from '$planner/trpc';
import { type CustomCourse } from '$planner/types/types';
import AddIcon from '@mui/icons-material/Add';
import { Collapse } from '@mui/material';
import { useCallback, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';

import CustomCourseCard from './CustomCourseCard';
import SavedCourseList from './SavedCourses';

const SavedCourses = () => {
    const [open, setOpen] = useState(true);
    const toggleExpand = () => setOpen(!open);
    return (
        <div className="saved-courses">
            <ClickableDiv className="header-tab" onClick={toggleExpand}>
                <h4>Saved</h4>
                <ExpandMore expanded={open} onClick={toggleExpand} />
            </ClickableDiv>
            <Collapse in={open} unmountOnExit>
                <div className="section-content">
                    <SavedCourseList />
                </div>
            </Collapse>
        </div>
    );
};

const CustomCourses = () => {
    const [open, setOpen] = useState(true);
    const toggleExpand = () => setOpen(!open);
    const dispatch = useAppDispatch();
    const isLoggedIn = useIsLoggedIn();
    const userCustomCourses = useAppSelector((state) => state.customCourses.userCustomCourses);
    const customCoursesCopy = deepCopy(userCustomCourses);

    const addCard = useCallback(() => {
        trpc.customCourses.addCustomCard
            .mutate({ name: '', description: '', units: 0 })
            .then((id) => dispatch(addCustomCourse({ id, courseName: '', units: 0, description: '' })));
    }, [dispatch]);

    const handleUpdate = (course: CustomCourse) => {
        dispatch(updateCustomCourse({ ...course }));
        dispatch(updateRoadmapCustomCourse(course));
    };

    return (
        <div className="custom-courses">
            <ClickableDiv className="header-tab" onClick={toggleExpand}>
                <h4>Custom Cards</h4>
                <ExpandMore expanded={open} onClick={toggleExpand} />
            </ClickableDiv>
            <Collapse in={open} unmountOnExit>
                <div className="section-content">
                    {!isLoggedIn ? (
                        <p className="custom-cards-logged-out">Log in to use custom cards!</p>
                    ) : (
                        <>
                            <ReactSortable
                                list={customCoursesCopy}
                                sort={false}
                                setList={() => {}}
                                onStart={(evt) => {
                                    const draggedCourse = userCustomCourses[evt.oldIndex!];
                                    if (!draggedCourse) return;

                                    dispatch(setActiveCustomCourse({ course: draggedCourse }));
                                }}
                                {...customCourseSortable}
                            >
                                {userCustomCourses.map((course) => (
                                    <CustomCourseCard
                                        key={course.id}
                                        course={course}
                                        handleUpdate={handleUpdate}
                                        inRoadmap={false}
                                    />
                                ))}
                            </ReactSortable>

                            <button className="add-card-button" type="button" onClick={addCard}>
                                <AddIcon />
                            </button>
                        </>
                    )}
                </div>
            </Collapse>
        </div>
    );
};

export const Library = () => {
    return (
        <div className="library">
            <SavedCourses />
            <CustomCourses />
        </div>
    );
};

export default Library;
