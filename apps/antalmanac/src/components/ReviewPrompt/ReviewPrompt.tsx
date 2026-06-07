'use client';

import { EnrollmentConfirmStep } from '$components/ReviewPrompt/EnrollmentConfirmStep';
import { ReviewStep } from '$components/ReviewPrompt/ReviewStep';
import { SuccessStep } from '$components/ReviewPrompt/SuccessStep';
import { authClient } from '$lib/auth/authClient';
import { useReviewPromptStore } from '$stores/ReviewPromptStore';
import { Paper, Snackbar } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

const PROMPT_DELAY_MS = 15_000;

export function ReviewPrompt() {
    const { data: session } = authClient.useSession();
    const userId = session?.user.id;

    const { step, candidate, initPrompt } = useReviewPromptStore(
        useShallow((s) => ({ step: s.step, candidate: s.candidate, initPrompt: s.initPrompt }))
    );

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const promptInitialized = useRef(false);

    // Trigger candidate selection once the session is confirmed and the user
    // has had a moment to settle into the page.
    useEffect(() => {
        if (!session || !userId || promptInitialized.current) return;
        promptInitialized.current = true;

        timerRef.current = setTimeout(() => {
            initPrompt();
        }, PROMPT_DELAY_MS);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [session, userId, initPrompt]);

    const open = step !== 'hidden' && !!candidate;

    return (
        <Snackbar open={open} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Paper sx={{ width: 500 }}>
                {step === 'enrollment-confirm' && candidate && <EnrollmentConfirmStep />}
                {step === 'review' && candidate && <ReviewStep />}
                {step === 'success' && candidate && <SuccessStep />}
            </Paper>
        </Snackbar>
    );
}
