import BackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Button, IconButton, Paper, Tooltip, useMediaQuery } from '@mui/material';
import { type FC, type ReactNode, useEffect } from 'react';
import Twemoji from 'react-twemoji';

import { getProfessorTerms } from '../../helpers/reviews';
import { checkModalOpen, sortTerms, unionTerms } from '../../helpers/util';
import { useProfessorData } from '../../hooks/professorReviews';
import { useAppDispatch } from '../../store/hooks';
import { setShowToast, setToastMsg, setToastSeverity } from '../../store/slices/roadmapSlice';
import { type ProfessorGQLData } from '../../types/types';
import GradeDist from '../GradeDist/GradeDist';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { ResultPageSection } from '../ResultPageContent/ResultPageContent';
import Review from '../Review/Review';
import Schedule from '../Schedule/Schedule';
import SideInfo from '../SideInfo/SideInfo';
import PreviewNavBar from './PreviewNavBar';

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
                id="preview-details"
                className="professor-summary"
                searchType="instructor"
                name={data.name}
                title={data.title}
                description={data.department}
                tags={[data.ucinetid, ...data.shortenedNames]}
                professor={data}
            />

            <ResultPageSection id="preview-grades" title="📊 Grade Distribution">
                <GradeDist professor={data} />
            </ResultPageSection>

            <ResultPageSection id="preview-schedule" title="🗓️ Schedule of Classes">
                <Schedule professorIDs={data.shortenedNames} termsOffered={unionTerms(data.courses)} />
            </ResultPageSection>

            <ResultPageSection id="preview-reviews" title="💬 Reviews">
                <Review professor={data} terms={sortTerms(getProfessorTerms(data))} />
            </ResultPageSection>
        </div>
    );
};

const ProfessorPreview: FC<{ netid: string; onClose: () => void; onBack: () => void; showBack: boolean }> = ({
    netid,
    onClose,
    onBack,
    showBack,
}) => {
    netid = netid.replace(/\s/g, '');
    const professorData = useProfessorData(netid);
    const isLoading = false;
    const dispatch = useAppDispatch();

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
                {showBack && (
                    <Tooltip title="Go Back">
                        <IconButton onClick={onBack}>
                            <BackIcon />
                        </IconButton>
                    </Tooltip>
                )}
                <PreviewTitle isLoading={isLoading} netId={netid} professorData={professorData} />
                <PreviewNavBar />
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
