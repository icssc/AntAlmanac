import { Check, Link } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';

import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';

interface ShareScheduleButtonProps {
    index: number;
    disabled?: boolean;
}

export function ShareScheduleButton({ index, disabled }: ShareScheduleButtonProps) {
    const [copied, setCopied] = useState(false);
    const { sessionIsValid } = useSessionStore();
    const { enqueueSnackbar } = useSnackbar();

    const handleCopy = useCallback(async () => {
        if (!sessionIsValid) {
            enqueueSnackbar('Please sign in to share schedules', { variant: 'error' });
            return;
        }

        const scheduleId = AppStore.getScheduleId(index);
        if (!scheduleId) {
            enqueueSnackbar('Unable to find a shareable ID for this schedule. Try saving your schedule first.', {
                variant: 'error',
            });
            return;
        }

        const shareUrl = `${window.location.origin}/share/${scheduleId}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            enqueueSnackbar('Link copied to clipboard!', { variant: 'success' });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            enqueueSnackbar('Failed to copy link', { variant: 'error' });
        }
    }, [index, sessionIsValid, enqueueSnackbar]);

    return (
        <Tooltip title="Copy Share Link" disableInteractive>
            <span>
                <IconButton
                    onClick={handleCopy}
                    size="small"
                    disabled={disabled}
                    color={copied ? 'success' : 'default'}
                >
                    {copied ? <Check /> : <Link />}
                </IconButton>
            </span>
        </Tooltip>
    );
}
