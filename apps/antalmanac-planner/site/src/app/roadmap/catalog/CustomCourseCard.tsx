import './CustomCourseCard.scss';
import { FC, useCallback, useEffect, useState } from 'react';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { IconButton, TextField } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import CheckIcon from '@mui/icons-material/Check';
import { useAppDispatch } from '../../../store/hooks';
import { removeCustomCourse } from '../../../store/slices/customCourseSlice';
import { CustomCourse } from '../../../types/types';
import { removeCustomCourseFromRoadmap } from '../../../store/slices/roadmapSlice';
import { useIsLoggedIn } from '../../../hooks/isLoggedIn';
import trpc from '../../../trpc';

interface CustomCourseCardProps {
  course: CustomCourse;
  handleUpdate: (customCourse: CustomCourse) => void;
  inRoadmap: boolean;
  removeCourseAt?: () => void;
}

export const CustomCourseCard: FC<CustomCourseCardProps> = ({ course, handleUpdate, inRoadmap, removeCourseAt }) => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useIsLoggedIn();
  const hasEmptyTitle = !course.courseName.trim();

  const [editing, setEditing] = useState(!inRoadmap && hasEmptyTitle);
  const [saving, setSaving] = useState(false);

  const [newName, setNewName] = useState<string>(course.courseName);
  const [newUnits, setNewUnits] = useState<number>(course.units);
  const [newDescription, setNewDescription] = useState<string>(course.description);

  useEffect(() => {
    if (inRoadmap || editing) return;
    setNewName(course.courseName);
    setNewUnits(course.units);
    setNewDescription(course.description);
  }, [course.courseName, course.units, course.description, course.id, editing, inRoadmap]);

  const onDelete = useCallback(async () => {
    if (isLoggedIn) {
      await trpc.customCourses.deleteCustomCard.mutate(course.id);
    }
    dispatch(removeCustomCourse(course.id));
    dispatch(removeCustomCourseFromRoadmap(course.id));
  }, [dispatch, course.id, isLoggedIn]);

  const handleStartEdit = () => {
    setNewName(course.courseName);
    setNewUnits(course.units);
    setNewDescription(course.description);
    setEditing(true);
  };

  const persistChanges = useCallback(async () => {
    const rawUnits = newUnits;
    const units = Number.isFinite(rawUnits) && rawUnits >= 0 ? rawUnits : 0;
    const updated: CustomCourse = {
      ...course,
      courseName: newName ?? '',
      units,
      description: newDescription ?? '',
    };

    if (!isLoggedIn) {
      handleUpdate(updated);
      return;
    }

    await trpc.customCourses.editCustomCard.mutate({
      id: updated.id,
      name: updated.courseName,
      description: updated.description,
      units: updated.units,
    });

    handleUpdate(updated);
  }, [course, newDescription, newName, newUnits, handleUpdate, isLoggedIn]);

  const commitSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await persistChanges();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    void commitSave();
  };

  const handleKeyDownEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void commitSave();
    }
  };

  if (inRoadmap) {
    return (
      <div className="custom-card">
        <div className="course-drag-handle">
          <DragIndicatorIcon />
        </div>

        <div className="main">
          <div className="course-card-top">
            <span className="name">{course.courseName}</span>

            <span className="units">
              <>{course.units} units</>
            </span>

            <IconButton className="course-delete-btn" onClick={removeCourseAt} aria-label="delete">
              <DeleteOutlineIcon className="course-delete-icon" />
            </IconButton>
          </div>
          <div className="course-description description-body">{course.description}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-card">
      <div className="course-drag-handle">
        <DragIndicatorIcon />
      </div>

      {editing ? (
        <div className="main">
          <div className="course-card-top">
            <span className="name">
              <TextField
                className="name-input"
                value={newName ?? ''}
                placeholder="Title"
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDownEdit}
              />
            </span>

            <span className="units">
              <TextField
                className="units-input"
                type="number"
                value={Number.isFinite(newUnits) ? newUnits : ''}
                placeholder="Units"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setNewUnits(Number.isFinite(v) ? v : NaN);
                }}
                onKeyDown={handleKeyDownEdit}
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
              />
            </span>

            <IconButton
              className="course-save-btn"
              onClick={handleSaveClick}
              aria-label="Save changes"
              disabled={saving}
            >
              <CheckIcon />
            </IconButton>

            <IconButton className="course-delete-btn" onClick={onDelete} aria-label="delete">
              <DeleteOutlineIcon className="course-delete-icon" />
            </IconButton>
          </div>
          <div className="course-description">
            <TextField
              className="description-input"
              value={newDescription ?? ''}
              placeholder="Description"
              onChange={(e) => setNewDescription(e.target.value)}
              onKeyDown={handleKeyDownEdit}
            />
          </div>
        </div>
      ) : (
        <div className="main">
          <div className="course-card-top">
            <span className="name">{course.courseName}</span>

            <span className="units">
              <>{course.units} units</>
            </span>

            <IconButton className="course-edit-btn" onClick={handleStartEdit} aria-label="Edit custom card">
              <ModeEditIcon />
            </IconButton>

            <IconButton className="course-delete-btn" onClick={onDelete} aria-label="delete">
              <DeleteOutlineIcon className="course-delete-icon" />
            </IconButton>
          </div>
          <div className="course-description description-body">{course.description}</div>
        </div>
      )}
    </div>
  );
};

export default CustomCourseCard;
