import { undoDelete } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useFallbackStore } from '$stores/FallbackStore';
import { Undo as UndoIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback } from 'react';

export function ToolbarUndoButton() {
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const postHog = usePostHog();

    const handleUndo = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.UNDO,
        });
        undoDelete(null);
    }, [postHog]);

    return (
        <Tooltip title="Undo last action">
            <IconButton onClick={handleUndo} size="medium" disabled={fallbackMode}>
                <UndoIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    );
}
