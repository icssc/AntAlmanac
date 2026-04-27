import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Check, Link } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ShareScheduleButtonProps {
    index: number;
    disabled?: boolean;
}

export function ShareScheduleButton({ index, disabled }: ShareScheduleButtonProps) {
    const [copied, setCopied] = useState(false);
    const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sessionIsValid = useSessionStore((state) => state.sessionIsValid);
    const postHog = usePostHog();

    const handleCopy = useCallback(async () => {
        const scheduleId = AppStore.getScheduleId(index);
        if (!scheduleId) {
            openSnackbar('error', 'Unable to find a shareable ID for this schedule. Try saving your schedule first.');
            return;
        }

        const shareUrl = `${window.location.origin}/share/${scheduleId}`;

        try {
            await navigator.clipboard.writeText(shareUrl);

            const scheduleName = AppStore.getScheduleNames()[index];
            logAnalytics(postHog, {
                category: analyticsEnum.sharedSchedule,
                action: analyticsEnum.sharedSchedule.actions.COPY_SCHEDULE,
                label: scheduleName,
            });

            if (copiedTimeoutRef.current) {
                clearTimeout(copiedTimeoutRef.current);
            }
            setCopied(true);
            openSnackbar('success', `Link copied to clipboard!`, { style: { whiteSpace: 'pre-line' } });
            copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            openSnackbar('error', 'Failed to copy link');
        }
    }, [index, postHog]);

    useEffect(
        () => () => {
            if (copiedTimeoutRef.current) {
                clearTimeout(copiedTimeoutRef.current);
            }
        },
        []
    );

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
