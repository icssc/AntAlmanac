import { FC, useState, useContext, useEffect, useCallback } from 'react';
import MenuSection, { SectionDescription } from './MenuSection';
import MenuTile from './MenuTile';
import Select from 'react-select';
import ThemeContext from '../../../style/theme-context';
import { comboboxTheme } from '../../../helpers/courseRequirements';
import trpc from '../../../trpc';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  addUserAPExam,
  removeUserAPExam,
  updateUserExam,
  setSelectedApRewards,
  updateSelectedApReward,
  TransferWithUnread,
} from '../../../store/slices/transferCreditsSlice';
import { useIsLoggedIn } from '../../../hooks/isLoggedIn';
import { APExam, TransferredAPExam } from '@peterportal/types';
import './APExamsSection.scss';

interface ScoreSelectionProps {
  score: number;
  setScore: (value: number) => void;
}

interface APExamOption {
  value: APExam;
  label: string;
}

interface RewardsSelectProps {
  selectedIndex: number | undefined;
  options: string[];
  onSelect: (selected: number) => void;
}

type CoursesGrantedTree = string | { AND: CoursesGrantedTree[] } | { OR: CoursesGrantedTree[] };

const ScoreSelection: FC<ScoreSelectionProps> = ({ score, setScore }) => {
  return (
    <div className="select">
      <select
        value={score ?? ''}
        onInput={(event) => setScore(parseInt((event.target as HTMLInputElement).value))}
        className="select-box"
      >
        <optgroup label="Score">
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
        </optgroup>
      </select>
    </div>
  );
};

const RewardsSelect: FC<RewardsSelectProps> = ({ selectedIndex = 0, options, onSelect }) => {
  return (
    <div className="select">
      <select value={selectedIndex} onChange={(event) => onSelect(Number(event.target.value))} className="select-box">
        <optgroup label="Options">
          {options.map((opt, i) => (
            <option key={i} value={i}>
              {opt}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};

const Rewards: FC<{ examName: string; coursesGranted: CoursesGrantedTree }> = ({ examName, coursesGranted }) => {
  const selectedApRewards = useAppSelector((state) => state.transferCredits.selectedApRewards);
  const selectedReward = selectedApRewards.find((reward) => reward.examName === examName);
  const dispatch = useAppDispatch();
  const isLoggedIn = useIsLoggedIn();

  const handleSelect = (selectedIndex: number) => {
    // path column to be removed in a future PR
    dispatch(updateSelectedApReward({ examName, path: '', selectedIndex }));
    if (!isLoggedIn) return;
    trpc.transferCredits.setSelectedAPReward.mutate({ examName, path: '', selectedIndex });
  };

  const formatCourses = (tree: CoursesGrantedTree): string => {
    if (typeof tree === 'string') return tree;
    if ('AND' in tree) return tree.AND.map(formatCourses).join(', ');
    if ('OR' in tree) return tree.OR.map(formatCourses).join(' or ');
    return 'This exam does not clear any courses.';
  };

  const renderTree = (tree: CoursesGrantedTree): React.ReactNode => {
    if (tree === '') {
      return <span>This exam does not clear any courses.</span>;
    }
    if (typeof tree === 'string') {
      return <span>{tree}</span>;
    }
    if ('AND' in tree && tree.AND.length > 0) {
      return (
        <span>
          {tree.AND.map((subtree, idx) => (
            <span key={idx}>
              {renderTree(subtree)}
              {idx < tree.AND.length - 1 && ' and '}
            </span>
          ))}
        </span>
      );
    }
    if ('OR' in tree) {
      const options = tree.OR.map(formatCourses);
      return (
        <span>
          <RewardsSelect selectedIndex={selectedReward?.selectedIndex ?? 0} options={options} onSelect={handleSelect} />
        </span>
      );
    }
    return <div>This exam does not clear any courses.</div>;
  };

  return <div className="rewards">{renderTree(coursesGranted)}</div>;
};

const APCreditMenuTile: FC<{ exam: TransferWithUnread<TransferredAPExam> }> = ({ exam }) => {
  const { examName, score, units, unread } = exam;

  const updateScore = (value: number) => handleUpdate(value, units);
  const updateUnits = (value: number) => handleUpdate(score, value);
  const apExamInfo = useAppSelector((state) => state.transferCredits.apExamInfo);
  const isLoggedIn = useIsLoggedIn();
  const dispatch = useAppDispatch();
  const apiExamInfo = apExamInfo.find((exam) => exam.fullName === examName);

  const selectBox = <ScoreSelection score={score} setScore={updateScore} />;

  const getApplicableReward = useCallback(
    (score: number) => {
      for (const reward of apiExamInfo?.rewards ?? []) {
        if (!reward.acceptableScores.includes(score)) continue;
        return reward;
      }
      return null;
    },
    [apiExamInfo],
  );

  const handleUpdate = useCallback(
    async (newScore: number, newUnits: number) => {
      if (newScore != score) {
        const reward = getApplicableReward(newScore);
        newUnits = reward?.unitsGranted ?? 0;
      }
      dispatch(updateUserExam({ examName, score: newScore, units: newUnits }));
      if (!isLoggedIn) return;
      trpc.transferCredits.updateUserAPExam.mutate({ examName, score: newScore, units: newUnits });
    },
    [dispatch, examName, getApplicableReward, isLoggedIn, score],
  );

  const deleteFn = useCallback(() => {
    dispatch(removeUserAPExam(examName));
    if (!isLoggedIn) return;
    trpc.transferCredits.deleteUserAPExam.mutate(examName);
  }, [dispatch, examName, isLoggedIn]);

  const coursesGranted = (getApplicableReward(score)?.coursesGranted ?? '') as CoursesGrantedTree;

  return (
    <MenuTile
      title={examName}
      headerItems={selectBox}
      units={units}
      setUnits={updateUnits}
      deleteFn={deleteFn}
      unread={unread}
    >
      <Rewards examName={examName} coursesGranted={coursesGranted} />
    </MenuTile>
  );
};

const APExamsSection: FC = () => {
  const isLoggedIn = useIsLoggedIn();
  const dispatch = useAppDispatch();
  const isDark = useContext(ThemeContext).darkMode;
  const apExamInfo = useAppSelector((state) => state.transferCredits.apExamInfo);
  const userAPExams = useAppSelector((state) => state.transferCredits.userAPExams);
  const [examName, setExamName] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  // Set selected rewards
  useEffect(() => {
    if (!isLoggedIn) return;
    trpc.transferCredits.getSelectedAPRewards.query().then((rewards) => {
      dispatch(setSelectedApRewards(rewards));
    });
  }, [dispatch, isLoggedIn]);

  // Save AP Exam to store
  useEffect(() => {
    if (!examName || !score) return;
    const examInfo = apExamInfo.find((exam) => exam.fullName === examName);
    const units = examInfo?.rewards?.find((r) => r.acceptableScores.includes(score))?.unitsGranted ?? 0;

    if (!userAPExams.find((exam) => exam.examName === examName)) {
      dispatch(addUserAPExam({ examName, score, units }));
      if (isLoggedIn) trpc.transferCredits.addUserAPExam.mutate({ examName, score, units });
    }

    // Remove exam from select options
    setExamName(null);
    setScore(null);
  }, [dispatch, examName, score, apExamInfo, userAPExams, isLoggedIn]);

  const baseSelectOptions: APExamOption[] = apExamInfo.map((exam) => ({
    value: exam,
    label: exam.fullName,
  }));

  const apSelectOptions = baseSelectOptions.filter((exam) => {
    return !userAPExams.some((userExam) => userExam.examName === exam.label);
  });

  return (
    <MenuSection title="AP Exam Credits">
      <SectionDescription>
        Enter the names of AP Exams that you&rsquo;ve taken to clear course prerequisites.
      </SectionDescription>
      {userAPExams.map((exam) => (
        <APCreditMenuTile key={exam.examName} exam={exam} />
      ))}
      <div className="ap-import-row">
        <div className="exam-input">
          <Select
            className="ppc-combobox"
            classNamePrefix="ppc-combobox"
            value={apSelectOptions.find((opt) => opt.label === examName) ?? null}
            options={apSelectOptions}
            isSearchable
            onChange={(selectedOption) => setExamName(selectedOption?.label || null)}
            placeholder="Add an AP Exam..."
            theme={(t) => comboboxTheme(t, isDark)}
          />
        </div>
        <div className="score-input">
          <Select
            className="ppc-combobox"
            classNamePrefix="ppc-combobox"
            value={score ? { value: score, label: score.toString() } : null}
            options={[
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
              { value: 5, label: '5' },
            ]}
            onChange={(selectedOption) => setScore(selectedOption?.value || null)}
            placeholder="Score"
            theme={(t) => comboboxTheme(t, isDark)}
          />
        </div>
      </div>
    </MenuSection>
  );
};

export default APExamsSection;
