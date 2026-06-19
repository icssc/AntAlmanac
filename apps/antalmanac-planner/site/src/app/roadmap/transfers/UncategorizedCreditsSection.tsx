import { FC, useState } from 'react';
import MenuSection, { SectionDescription } from './MenuSection';
import MenuTile from './MenuTile';
import { TextField, Button } from '@mui/material';
import trpc from '../../../trpc';
import {
  addUncategorizedCourse,
  updateUncategorizedCourse,
  removeUncategorizedCourse,
  TransferWithUnread,
} from '../../../store/slices/transferCreditsSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { TransferredUncategorized } from '@peterportal/types';
import './UncategorizedCreditsSection.scss';

const UncategorizedMenuTile: FC<{ course: TransferWithUnread<TransferredUncategorized> }> = ({ course }) => {
  const { name, units, unread } = course;
  const dispatch = useAppDispatch();

  const setUnits = (newUnits: number) => {
    const updatedCourse: TransferredUncategorized = { name, units: newUnits };
    trpc.transferCredits.updateUncategorizedCourse.mutate(updatedCourse);
    dispatch(updateUncategorizedCourse(updatedCourse));
  };

  const deleteFn = () => {
    trpc.transferCredits.removeUncategorizedCourse.mutate({ name, units });
    dispatch(removeUncategorizedCourse({ name, units }));
  };

  return <MenuTile title={name ?? ''} units={units ?? 0} setUnits={setUnits} deleteFn={deleteFn} unread={unread} />;
};

const UncategorizedCreditInput: FC<{ courses: TransferWithUnread<TransferredUncategorized>[] }> = ({ courses }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [units, setUnits] = useState('');
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const existingCourseNames = courses.map((course) => course.name);

  const updateName = (newName: string) => {
    if (newName.length <= 20) {
      setName(newName);
      setError(false);
      setErrorText('');
    } else {
      setError(true);
      setErrorText('Name is too long');
    }
  };

  const updateUnits = (newUnits: string) => {
    if (newUnits == '' || (parseFloat(newUnits) >= 0 && parseFloat(newUnits) < 1000)) {
      setUnits(newUnits);
      setError(false);
      setErrorText('');
    } else {
      setError(true);
      setErrorText('');
    }
  };

  const handleSubmit = () => {
    if (existingCourseNames.includes(name)) {
      setError(true);
      setErrorText('Item already exists');
      return;
    }

    const newCredit: TransferredUncategorized = { name, units: parseFloat(units) };
    trpc.transferCredits.addUncategorizedCourse.mutate(newCredit);
    dispatch(addUncategorizedCourse(newCredit));

    setName('');
    setUnits('');
    setError(false);
    setErrorText('');
  };

  return (
    <div className="uncategorized-credit-input-row">
      <TextField
        className="name-input"
        required
        size="small"
        type="text"
        name="name"
        placeholder="Add name..."
        value={name}
        onChange={(e) => updateName(e.target.value)}
        error={error}
        helperText={errorText}
      />

      <TextField
        className="unit-input"
        required
        size="small"
        type="number"
        name="units"
        placeholder="Units"
        value={units}
        onChange={(e) => updateUnits(e.target.value)}
        error={error}
      />

      <Button
        className="submit-button"
        variant="contained"
        disabled={name === '' || units === ''}
        onClick={handleSubmit}
      >
        Add
      </Button>
    </div>
  );
};

const UncategorizedCreditsSection: FC = () => {
  const courses = useAppSelector((state) => state.transferCredits.uncategorizedCourses);

  return (
    <MenuSection title="Elective Credits">
      <SectionDescription>
        Elective credits count towards your total units but will not clear prerequisites. If an item should clear
        prerequisites, consider adding its UCI equivalent in the Courses or AP Exams section instead.
      </SectionDescription>

      {courses.map((course) => (
        <UncategorizedMenuTile key={`${course.name}-${course.units}`} course={course} />
      ))}

      <UncategorizedCreditInput courses={courses} />
    </MenuSection>
  );
};

export default UncategorizedCreditsSection;
