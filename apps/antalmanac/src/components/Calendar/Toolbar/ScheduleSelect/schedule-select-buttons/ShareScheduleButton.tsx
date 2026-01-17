import { Check, Link } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
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

    const handleCopy = useCallback(async () => {
        const scheduleId = AppStore.getScheduleId(index);
        if (!scheduleId) {
            AppStore.openSnackbar(
                'error',
                'Unable to find a shareable ID for this schedule. Try saving your schedule first.'
            );
            return;
        }

        const shareUrl = `${window.location.origin}/share/${scheduleId}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            AppStore.openSnackbar('success', 'Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            AppStore.openSnackbar('error', 'Failed to copy link');
        }
    }, [index]);

    const isDisabled = disabled || !sessionIsValid;
    const tooltipTitle = !sessionIsValid
        ? 'Please sign in to share schedules'
        : copied
          ? 'Link copied!'
          : 'Copy Share Link';

    return (
        <Tooltip title={tooltipTitle} disableInteractive>
            <span>
                <IconButton
                    onClick={handleCopy}
                    size="small"
                    disabled={isDisabled}
                    color={copied ? 'success' : 'default'}
                >
                    {copied ? <Check /> : <Link />}
                </IconButton>
            </span>
        </Tooltip>
    );
}
