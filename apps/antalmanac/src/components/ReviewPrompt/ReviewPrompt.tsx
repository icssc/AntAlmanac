'use client';

import { useReviewPromptStore } from '$stores/ReviewPromptStore';
import { useSessionStore } from '$stores/SessionStore';
import { Paper, Snackbar } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { EnrollmentConfirmStep } from './EnrollmentConfirmStep';
import { ReviewStep } from './ReviewStep';

const PROMPT_DELAY_MS = 15_000;

export function ReviewPrompt() {
    const { userId, sessionIsValid } = useSessionStore(
        useShallow((s) => ({ userId: s.userId, sessionIsValid: s.sessionIsValid }))
    );

    const { candidate, step, rating, selectedTags, initPrompt, confirm, dismiss, setRating, toggleTag, submitReview } =
        useReviewPromptStore();

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
            <Paper elevation={6} sx={{ width: 340, borderRadius: 2 }}>
                {step === 'enrollment-confirm' && candidate && (
                    <EnrollmentConfirmStep
                        courseId={candidate.courseId}
                        courseTitle={candidate.courseTitle}
                        professorId={candidate.professorId}
                        term={candidate.term}
                        onConfirm={confirm}
                        onDismiss={dismiss}
                    />
                )}

                {step === 'review' && candidate && (
                    <ReviewStep
                        courseId={candidate.courseId}
                        professorId={candidate.professorId}
                        rating={rating}
                        selectedTags={selectedTags}
                        onRatingChange={setRating}
                        onTagToggle={toggleTag}
                        onSubmit={submitReview}
                        onDismiss={dismiss}
                    />
                )}
            </Paper>
        </Snackbar>
    );
}
