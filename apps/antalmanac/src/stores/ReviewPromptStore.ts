import trpc from '$lib/api/trpc';
import { termData } from '$lib/termData';
import AppStore from '$stores/AppStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';

// Tags
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

// Review candidate types
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

// Dismissed combos storage
const DISMISSED_KEY = 'aa_review_dismissed';
const MAX_DISMISSED = 100;
/** How many past terms (in termData order, most recent first) to consider. */
const PAST_TERMS_WINDOW = 4;

type DismissedEntry = { courseId: string; professorId: string };

function loadDismissed(): DismissedEntry[] {
    try {
        const parsed: unknown = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (item): item is DismissedEntry =>
                typeof item === 'object' &&
                item !== null &&
                typeof item.courseId === 'string' &&
                typeof item.professorId === 'string'
        );
    } catch {
        return [];
    }
}

function persistDismissed(candidate: ReviewCandidate) {
    const dismissed = loadDismissed();
    const alreadyPresent = dismissed.some(
        (d) => d.courseId === candidate.courseId && d.professorId === candidate.professorId
    );
    if (!alreadyPresent) {
        const updated = [...dismissed, { courseId: candidate.courseId, professorId: candidate.professorId }].slice(
            -MAX_DISMISSED
        );
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
    }
}

// Review prompt store
const initialState = {
    candidate: null as ReviewCandidate | null,
    step: 'hidden' as Step,
    rating: 0,
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

            // Gather unique {courseId, professorId, term} combos from ALL schedules.
            const allCourses = AppStore.schedule.getAllCourses();
            const seen = new Set<string>();
            const candidates: ReviewCandidate[] = [];

            for (const course of allCourses) {
                // Schedule stores terms as "2025-Fall"; termData.shortName uses "2025 Fall".
                const normalizedTerm = course.term.replace('-', ' ');
                if (!pastTermNames.has(normalizedTerm)) continue;

                const instructor = course.section.instructors?.[0];
                if (!instructor) continue;

                const courseId = `${course.deptCode} ${course.courseNumber}`;
                const dedupKey = `${courseId}::${instructor}::${normalizedTerm}`;
                if (seen.has(dedupKey)) continue;
                seen.add(dedupKey);

                candidates.push({
                    courseId,
                    courseTitle: course.courseTitle,
                    professorId: instructor,
                    term: normalizedTerm,
                });
            }

            if (candidates.length === 0) return;

            // Filter out already-dismissed combos (localStorage).
            const dismissed = loadDismissed();
            const dismissedSet = new Set(dismissed.map((d) => `${d.courseId}::${d.professorId}`));

            // Filter out already-reviewed combos (DB).
            let reviewedSet = new Set<string>();
            try {
                const reviewed = await trpc.review.getReviewedCombos.query();
                reviewedSet = new Set(reviewed.map((r) => `${r.courseId}::${r.professorId}`));
            } catch {
                // Non-fatal — proceed without DB filter.
            }

            const eligible = candidates.filter((c) => {
                const key = `${c.courseId}::${c.professorId}`;
                return !dismissedSet.has(key) && !reviewedSet.has(key);
            });

            if (eligible.length === 0) return;

            // Pick a random eligible candidate and surface the prompt.
            const candidate = eligible[Math.floor(Math.random() * eligible.length)];
            set({ step: 'enrollment-confirm', candidate, rating: 0, selectedTags: [] });
        },

        /** User confirmed they took the course — advance to the rating step. */
        confirm: () => set({ step: 'review' }),

        /**
         * User dismissed the prompt (either "No" or closed the card).
         * Persists the combo to localStorage so it won't be shown again.
         */
        dismiss: () => {
            const { candidate } = get();
            if (candidate) persistDismissed(candidate);
            set({ step: 'hidden', candidate: null, rating: 0, selectedTags: [] });
        },

        setRating: (rating: number) => set({ rating }),

        toggleTag: (tag: ReviewTag) => {
            const { selectedTags } = get();
            set({
                selectedTags: selectedTags.includes(tag)
                    ? selectedTags.filter((t) => t !== tag)
                    : [...selectedTags, tag],
            });
        },

        /** Submit the review and hide the prompt on success. */
        submitReview: async () => {
            const { candidate, rating, selectedTags } = get();
            if (!candidate || rating === 0) return;

            try {
                await trpc.review.submitReview.mutate({
                    professorId: candidate.professorId,
                    courseId: candidate.courseId,
                    quarter: candidate.term,
                    rating,
                    tags: selectedTags,
                });
                set({ step: 'hidden', candidate: null, rating: 0, selectedTags: [] });
                openSnackbar('success', 'Review submitted — thanks for helping other Anteaters!');
            } catch {
                openSnackbar('error', 'Failed to submit review. Please try again.');
            }
        },
    }))
);
