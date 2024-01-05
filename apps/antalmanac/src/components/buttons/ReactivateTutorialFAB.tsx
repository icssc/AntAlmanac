
import ReplayIcon from '@mui/icons-material/Replay';
import { Fab, Tooltip } from '@mui/material';
import useTourStore from '$stores/TourStore';

/** Floating action button (FAB) in the bottom right corner to reactivate the tutorial */
export default function TutorialFloater() {
    const { restartTour, tourEnabled } = useTourStore.getState();

    if (tourEnabled) return null;

    return (
        <Tooltip title="Restart tutorial">
            <Fab
                id="tutorial-floater"
                color="primary"
                aria-label="Restart tutorial"
                onClick={() => restartTour()}
                style={{
                    position: 'fixed',
                    bottom: '1rem',
                    right: '1rem',
                    zIndex: 999,
                    opacity: 0.5,
                    width: '4rem',
                    height: '4rem',
                }}
            >
                <ReplayIcon />
            </Fab>
        </Tooltip>
    );
}
