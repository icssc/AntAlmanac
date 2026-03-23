import { FC, ReactNode, useEffect } from 'react';
import { ResultPageSection } from '../ResultPageContent/ResultPageContent';
import GradeDist from '../GradeDist/GradeDist';
import Schedule from '../Schedule/Schedule';
import Review from '../Review/Review';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { checkModalOpen, sortTerms, unionTerms } from '../../helpers/util';
import { ProfessorGQLData } from '../../types/types';
import { Button, IconButton, Paper, Tooltip, useMediaQuery } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setToastMsg, setToastSeverity, setShowToast } from '../../store/slices/roadmapSlice';
import Twemoji from 'react-twemoji';

import CloseIcon from '@mui/icons-material/Close';
import BackIcon from '@mui/icons-material/ArrowBack';
import IosShareIcon from '@mui/icons-material/IosShare';
import { getProfessorTerms } from '../../helpers/reviews';
import SideInfo from '../SideInfo/SideInfo';
import { useProfessorData } from '../../hooks/professorReviews';

interface PreviewTitleProps {
  isLoading: boolean;
  netId: string;
  professorData: ProfessorGQLData | null;
}
const PreviewTitle: FC<PreviewTitleProps> = ({ isLoading, netId, professorData }) => {
  const wrapContent = (content: ReactNode) => <p className="preview-title">{content}</p>;
  const shortenText = useMediaQuery('(max-width: 480px)');

  if (isLoading || !professorData) {
    const loadingText = shortenText ? 'Loading...' : `Loading ${netId}...`;
    return wrapContent(loadingText);
  }

  const formattedCourseId = <b>{professorData.name}</b>;
  if (shortenText) {
    return wrapContent(formattedCourseId);
  }

  return wrapContent(<>Previewing {formattedCourseId}</>);
};

const ProfessorPreviewContent: FC<{ data: ProfessorGQLData | null }> = ({ data }) => {
  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <div className="preview-body">
      <SideInfo
        className="professor-summary"
        searchType="instructor"
        name={data.name}
        title={data.title}
        description={data.department}
        tags={[data.ucinetid, ...data.shortenedNames]}
        professor={data}
      />

      <ResultPageSection title="📊 Grade Distribution">
        <GradeDist professor={data} />
      </ResultPageSection>

      <ResultPageSection title="🗓️ Schedule of Classes">
        <Schedule professorIDs={data.shortenedNames} termsOffered={unionTerms(data.courses)} />
      </ResultPageSection>

      <ResultPageSection title="💬 Reviews">
        <Review professor={data} terms={sortTerms(getProfessorTerms(data))} />
      </ResultPageSection>
    </div>
  );
};

const ProfessorPreview: FC<{ netid: string; onClose: () => void; onBack: () => void }> = ({
  netid,
  onClose,
  onBack,
}) => {
  netid = netid.replace(/\s/g, '');
  const professorData = useProfessorData(netid);
  const isLoading = false;
  const dispatch = useAppDispatch();
  const previews = useAppSelector((state) => state.preview.previewStack);
  const previousPreview = previews.length > 1 ? previews[previews.length - 2] : null;

  const copyProfLink = () => {
    const url = new URL('/planner/instructor/' + netid, location.origin).toString();
    navigator.clipboard.writeText(url);
    dispatch(setToastMsg('Copied instructor URL to clipboard!'));
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
        <PreviewTitle isLoading={isLoading} netId={netid} professorData={professorData} />
        <Button
          variant="contained"
          color="inherit"
          startIcon={<IosShareIcon />}
          size="small"
          disableElevation
          onClick={copyProfLink}
        >
          Share
        </Button>
      </Paper>
      <Twemoji options={{ className: 'twemoji' }}>
        <ProfessorPreviewContent data={professorData} />
      </Twemoji>
    </div>
  );
};

export default ProfessorPreview;
