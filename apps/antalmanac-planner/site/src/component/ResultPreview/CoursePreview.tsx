import './ResultPreview.scss';
import { FC, ReactNode, useEffect } from 'react';
import { ResultPageSection } from '../ResultPageContent/ResultPageContent';
import GradeDist from '../GradeDist/GradeDist';
import Schedule from '../Schedule/Schedule';
import Review from '../Review/Review';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { checkModalOpen, sortTerms } from '../../helpers/util';
import CourseSummary from './CourseSummary';
import { LOADING_COURSE_PLACEHOLDER } from '../../helpers/courseRequirements';
import { CourseGQLData } from '../../types/types';
import { Button, IconButton, Paper, Tooltip, useMediaQuery } from '@mui/material';
import { CourseBookmarkButton } from '../CourseInfo/CourseInfo';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useCourseData } from '../../hooks/catalog';
import { setToastMsg, setToastSeverity, setShowToast } from '../../store/slices/roadmapSlice';
import Twemoji from 'react-twemoji';

import CloseIcon from '@mui/icons-material/Close';
import BackIcon from '@mui/icons-material/ArrowBack';
import IosShareIcon from '@mui/icons-material/IosShare';

interface PreviewTitleProps {
  isLoading: boolean;
  courseId: string;
  courseData: CourseGQLData;
}
const PreviewTitle: FC<PreviewTitleProps> = ({ isLoading, courseId, courseData }) => {
  const wrapContent = (content: ReactNode) => <p className="preview-title">{content}</p>;
  const shortenText = useMediaQuery('(max-width: 480px)');

  if (isLoading) {
    const loadingText = shortenText ? 'Loading...' : `Loading ${courseId}...`;
    return wrapContent(loadingText);
  }

  const formattedCourseId = (
    <b>
      {courseData.department} {courseData.courseNumber}
    </b>
  );
  if (shortenText) {
    return wrapContent(formattedCourseId);
  }

  return wrapContent(<>Previewing {formattedCourseId}</>);
};

const CoursePreviewContent: FC<{ data: CourseGQLData }> = ({ data }) => {
  if (data.id === LOADING_COURSE_PLACEHOLDER.id) {
    return <LoadingSpinner />;
  }

  return (
    <div className="preview-body">
      <ResultPageSection title={data.title}>
        <CourseSummary course={data} />
      </ResultPageSection>

      <ResultPageSection title="📊 Grade Distribution">
        <GradeDist course={data} />
      </ResultPageSection>

      <ResultPageSection title="🗓️ Schedule of Classes">
        <Schedule
          key={data.id}
          courseID={data.department + ' ' + data.courseNumber}
          termsOffered={sortTerms(data.terms)}
        />
      </ResultPageSection>

      <ResultPageSection title="💬 Reviews">
        <Review key={data.id} course={data} terms={sortTerms(data.terms)} />
      </ResultPageSection>
    </div>
  );
};

const CoursePreview: FC<{ courseId: string; onClose: () => void; onBack: () => void }> = ({
  courseId,
  onClose,
  onBack,
}) => {
  courseId = courseId.replace(/\s/g, '');
  const courseData = useCourseData(courseId);
  const isLoading = courseData.id === LOADING_COURSE_PLACEHOLDER.id;
  const dispatch = useAppDispatch();
  const previews = useAppSelector((state) => state.preview.previewStack);
  const previousPreview = previews.length > 1 ? previews[previews.length - 2] : null;

  const copyCourseLink = () => {
    const url = new URL('/planner/course/' + encodeURIComponent(courseId), location.origin).toString();
    navigator.clipboard.writeText(url);
    dispatch(setToastMsg('Copied course URL to clipboard!'));
    dispatch(setToastSeverity('success'));
    dispatch(setShowToast(true));
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const modified = event.altKey || event.shiftKey || event.ctrlKey || event.metaKey;
      if (event.key !== 'Escape' || modified) return;
      if (checkModalOpen()) return;
      event.preventDefault();
      onClose();
    };

    document.body.addEventListener('keydown', listener);
    return () => document.body.removeEventListener('keydown', listener);
  });

  return (
    <div className="result-preview">
      <Paper className="preview-header" variant="outlined">
        <Tooltip title="Exit Preview (Esc)">
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
        {previews.length > 1 && (
          <Tooltip title={previousPreview ? `Back to ${previousPreview.id}` : 'Go Back'}>
            <IconButton onClick={onBack}>
              <BackIcon />
            </IconButton>
          </Tooltip>
        )}
        <PreviewTitle isLoading={isLoading} courseId={courseId} courseData={courseData} />
        <Button
          variant="contained"
          color="inherit"
          startIcon={<IosShareIcon />}
          size="small"
          disableElevation
          onClick={copyCourseLink}
        >
          Share
        </Button>
        <CourseBookmarkButton course={courseData} disabled={isLoading} />
      </Paper>
      <Twemoji options={{ className: 'twemoji' }}>
        <CoursePreviewContent data={courseData} />
      </Twemoji>
    </div>
  );
};

export default CoursePreview;
