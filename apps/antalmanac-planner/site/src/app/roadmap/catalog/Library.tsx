import './Library.scss';
import { useState, useCallback } from 'react';
import { ExpandMore } from '../../../component/ExpandMore/ExpandMore';
import SavedCourseList from './SavedCourses';
import { Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CustomCourseCard from './CustomCourseCard';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addCustomCourse, updateCustomCourse } from '../../../store/slices/customCourseSlice';
import { ReactSortable } from 'react-sortablejs';
import { customCourseSortable } from '../../../helpers/sortable';
import { deepCopy } from '../../../helpers/util';
import { CustomCourse } from '../../../types/types';
import { setActiveCustomCourse, updateRoadmapCustomCourse } from '../../../store/slices/roadmapSlice';
import { useIsLoggedIn } from '../../../hooks/isLoggedIn';
import trpc from '../../../trpc';
import ClickableDiv from '../../../component/ClickableDiv/ClickableDiv';

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
                  <CustomCourseCard key={course.id} course={course} handleUpdate={handleUpdate} inRoadmap={false} />
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
