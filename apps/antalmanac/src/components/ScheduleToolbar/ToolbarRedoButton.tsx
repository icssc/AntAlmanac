import { redoAction } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useFallbackStore } from '$stores/FallbackStore';
import { Redo as RedoIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

export function ToolbarRedoButton() {
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const postHog = usePostHog();

    const handleRedo = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.REDO,
        });
        redoAction();
    }, [postHog]);

    return (
        <Tooltip title="Redo last action">
            <IconButton onClick={handleRedo} size="medium" disabled={fallbackMode}>
                <RedoIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}
