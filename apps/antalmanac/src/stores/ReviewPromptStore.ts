import trpc from '$lib/api/trpc';
import { termData } from '$lib/termData';
import AppStore from '$stores/AppStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export const REVIEW_TAGS = [
    'Textbook Required',
    'Mandatory Lecture',
    'Mandatory Discussion',
    'Curved',
    'Extra Credit',
    'Project Based',
    'Test Heavy',
] as const;

export type ReviewTag = (typeof REVIEW_TAGS)[number];

export type ReviewCandidate = {
    /** e.g. "ICS 31" */
    courseId: string;
    courseTitle: string;
    /** Raw WebSOC instructor name, e.g. "PATTIS, R." */
    professorId: string;
    /** AntAlmanac term shortName, e.g. "Fall 2024" */
    term: string;
};

type Step = 'enrollment-confirm' | 'review' | 'hidden';

const PAST_TERMS_WINDOW = 4;

/** Min time between review prompts after the user last dismissed, skipped, or submitted. */
const REVIEW_PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const initialState = {
    candidate: null as ReviewCandidate | null,
    step: 'hidden' as Step,
    rating: 0,
    difficulty: 0,
    selectedTags: [] as ReviewTag[],
};

export const useReviewPromptStore = create(
    combine(initialState, (set, get) => ({
        /**
         * Find a candidate course from the user's schedule history and surface the prompt.
         * Should be called once after the session is confirmed valid.
         */
        initPrompt: async () => {
            const today = new Date();

            // Collect past terms within the window (termData is ordered newest-first
            // after the filter in termData.ts — see its `filter(socAvailable <= today)`).
            // We further filter to terms whose finals have already ended.
            const pastTermNames = new Set<string>(
                termData
                    .filter((t) => t.finalsStartDate < today)
                    .slice(0, PAST_TERMS_WINDOW)
                    .map((t) => t.shortName)
            );

            if (pastTermNames.size === 0) return;

            const allCourses = AppStore.schedule.getAllCourses();
            const seen = new Set<string>();
            const candidates: ReviewCandidate[] = [];

            for (const course of allCourses) {
                const term = course.term;
                const sectionType = course.section.sectionType;

                if (!pastTermNames.has(term)) {
                    continue;
                }

                if (
                    sectionType === 'Act' ||
                    sectionType === 'Col' ||
                    sectionType === 'Dis' ||
                    sectionType === 'Qiz' ||
                    sectionType === 'Tap'
                ) {
                    continue;
                }

                const instructor = course.section.instructors?.[0];
                if (!instructor) {
                    continue;
                }

                const courseId = `${course.deptCode} ${course.courseNumber}`;
                const dedupKey = `${courseId}::${instructor}::${term}`;
                if (seen.has(dedupKey)) {
                    continue;
                }
                seen.add(dedupKey);

                candidates.push({
                    courseId,
                    courseTitle: course.courseTitle,
                    professorId: instructor,
                    term,
                });
            }

            if (candidates.length === 0) return;

            let dismissedSet = new Set<string>();
            let reviewedSet = new Set<string>();
            try {
                const [dismissed, reviewed, cooldown] = await Promise.all([
                    trpc.review.getDismissedCombos.query(),
                    trpc.review.getReviewedCombos.query(),
                    trpc.review.getReviewPromptLastInteractionAt.query(),
                ]);
                dismissedSet = new Set(dismissed.map((d) => `${d.courseId}::${d.professorId}`));
                reviewedSet = new Set(reviewed.map((r) => `${r.courseId}::${r.professorId}`));

                if (cooldown.lastInteractionAt) {
                    const elapsed = Date.now() - new Date(cooldown.lastInteractionAt).getTime();
                    if (elapsed < REVIEW_PROMPT_COOLDOWN_MS) {
                        return;
                    }
                }
            } catch {
                // Without dismissed/reviewed/cooldown we could re-prompt incorrectly; skip this run.
                return;
            }

            const eligible = candidates.filter((c) => {
                const key = `${c.courseId}::${c.professorId}`;
                return !dismissedSet.has(key) && !reviewedSet.has(key);
            });

            if (eligible.length === 0) {
                return;
            }

            const candidate = eligible[Math.floor(Math.random() * eligible.length)];
            set({ step: 'enrollment-confirm', candidate, rating: 0, difficulty: 0, selectedTags: [] });
        },

        confirm: () => set({ step: 'review' }),

        /**
         * User closed the prompt without submitting (X, Skip, "I did not", snackbar click-away, Escape).
         * Persists the course+professor combo so it is not suggested again and starts the cooldown window.
         */
        dismiss: () => {
            const { candidate } = get();
            set({ step: 'hidden', candidate: null, rating: 0, difficulty: 0, selectedTags: [] });
            if (candidate) {
                trpc.review.dismissReview
                    .mutate({ professorId: candidate.professorId, courseId: candidate.courseId })
                    .catch(() => {
                        // Non-fatal — worst case the user is prompted again on the next session.
                    });
            }
        },

        setRating: (rating: number) => set({ rating }),

        setDifficulty: (difficulty: number) => set({ difficulty }),

        toggleTag: (tag: ReviewTag) => {
            const { selectedTags } = get();
            set({
                selectedTags: selectedTags.includes(tag)
                    ? selectedTags.filter((t) => t !== tag)
                    : [...selectedTags, tag],
            });
        },

        submitReview: async () => {
            const { candidate, rating, difficulty, selectedTags } = get();
            if (!candidate || rating === 0 || difficulty === 0) return;

            try {
                await trpc.review.submitReview.mutate({
                    professorId: candidate.professorId,
                    courseId: candidate.courseId,
                    quarter: candidate.term,
                    rating,
                    difficulty,
                    tags: selectedTags,
                });
                set({ step: 'hidden', candidate: null, rating: 0, difficulty: 0, selectedTags: [] });
                openSnackbar('success', 'Review submitted — thanks for helping other Anteaters!');
            } catch {
                openSnackbar('error', 'Failed to submit review. Please try again.');
            }
        },
    }))
);
