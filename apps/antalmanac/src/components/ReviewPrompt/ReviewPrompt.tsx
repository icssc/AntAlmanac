'use client';

import { EnrollmentConfirmStep } from '$components/ReviewPrompt/EnrollmentConfirmStep';
import { ReviewStep } from '$components/ReviewPrompt/ReviewStep';
import { useReviewPromptStore } from '$stores/ReviewPromptStore';
import { useSessionStore } from '$stores/SessionStore';
import { Paper, Snackbar } from '@mui/material';
import { useEffect, useRef } from 'react';

const PROMPT_DELAY_MS = 15_000;

export function ReviewPrompt() {
    const userId = useSessionStore((s) => s.userId);
    const sessionIsValid = useSessionStore((s) => s.sessionIsValid);

    const step = useReviewPromptStore((s) => s.step);
    const candidate = useReviewPromptStore((s) => s.candidate);
    const initPrompt = useReviewPromptStore((s) => s.initPrompt);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const promptInitialized = useRef(false);

    // Trigger candidate selection once the session is confirmed and the user
    // has had a moment to settle into the page.
    useEffect(() => {
        if (!sessionIsValid || !userId || promptInitialized.current) return;
        promptInitialized.current = true;

        timerRef.current = setTimeout(() => {
            initPrompt();
        }, PROMPT_DELAY_MS);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [sessionIsValid, userId, initPrompt]);

    const open = step !== 'hidden' && !!candidate;

    return (
        <Snackbar open={open} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Paper elevation={6} sx={{ width: 350, borderRadius: 2 }}>
                {step === 'enrollment-confirm' && candidate && <EnrollmentConfirmStep />}

                {step === 'review' && candidate && <ReviewStep />}
            </Paper>
        </Snackbar>
    );
}
