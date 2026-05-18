import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import { type AATerm, termData } from '$lib/term';
import { postHog } from '$providers/PostHog';
import AppStore from '$stores/AppStore';
import type { WebsocSectionType } from '@packages/anteater-api/types';
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

type ReviewTag = (typeof REVIEW_TAGS)[number];

type ReviewCandidate = {
    /** e.g. "ICS 31" */
    courseId: string;
    courseTitle: string;
    /** Raw WebSOC instructor name, e.g. "PATTIS, R." */
    professorId: string;
    term: AATerm;
};

type Step = 'enrollment-confirm' | 'review' | 'hidden';

/**
 * When several schedule rows refer to the same course in the same term (e.g. Lec + Lab),
 * lower rank wins so we prompt for the lecture instructor instead of a lab TA. Pure-lab
 * courses only have Lab rows, so they still surface normally.
 */
function reviewPromptSectionRank(sectionType: WebsocSectionType): number {
    if (sectionType === 'Lec') {
        return 0;
    }
    if (sectionType === 'Lab') {
        return 2;
    }
    return 1;
}

const PAST_TERMS_WINDOW = 4;

/** Min time between review prompts after the user last dismissed, skipped, or submitted. */
const REVIEW_PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const initialState = {
    candidate: null as ReviewCandidate | null,
    step: 'hidden' as Step,
    rating: 0,
    difficulty: 0,
    selectedTags: [] as ReviewTag[],
    textReview: '',
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
                    .filter((t) => t.finalsStart < today)
                    .slice(0, PAST_TERMS_WINDOW)
                    .map((t) => t.shortName)
            );

            if (pastTermNames.size === 0) return;

            const allCourses = AppStore.schedule.getAllCourses();
            const bestByCourseTerm = new Map<
                string,
                {
                    courseId: string;
                    courseTitle: string;
                    professorId: string;
                    term: AATerm;
                    sectionType: WebsocSectionType;
                }
            >();

            for (const course of allCourses) {
                const term = course.term;
                const sectionType = course.section.sectionType;

                if (!pastTermNames.has(term.shortName)) {
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

                const instructor = course.section.instructors.at(0)?.trim();
                if (!instructor || instructor === 'STAFF') {
                    continue;
                }

                const courseId = `${course.deptCode} ${course.courseNumber}`;
                const groupKey = `${courseId}::${term.shortName}`;
                const next = {
                    courseId,
                    courseTitle: course.courseTitle,
                    professorId: instructor,
                    term,
                    sectionType,
                };
                const prev = bestByCourseTerm.get(groupKey);
                if (!prev || reviewPromptSectionRank(sectionType) < reviewPromptSectionRank(prev.sectionType)) {
                    bestByCourseTerm.set(groupKey, next);
                }
            }

            const seenCombo = new Set<string>();
            const candidates: ReviewCandidate[] = [];
            for (const row of bestByCourseTerm.values()) {
                const dedupKey = `${row.courseId}::${row.professorId}::${row.term.shortName}`;
                if (seenCombo.has(dedupKey)) {
                    continue;
                }
                seenCombo.add(dedupKey);
                candidates.push({
                    courseId: row.courseId,
                    courseTitle: row.courseTitle,
                    professorId: row.professorId,
                    term: row.term,
                });
            }

            if (candidates.length === 0) {
                return;
            }

            let dismissedSet = new Set<string>();
            let reviewedSet = new Set<string>();
            try {
                const [dismissed, reviewed, cooldown] = await Promise.all([
                    trpc.review.getDismissedCombos.query(),
                    trpc.review.getReviewedCombos.query(),
                    trpc.review.getReviewPromptLastInteractionAt.query(),
                ]);
                dismissedSet = new Set(dismissed.map((d) => `${d.courseId}::${d.professorId}::${d.term}`));
                reviewedSet = new Set(reviewed.map((r) => `${r.courseId}::${r.professorId}::${r.term}`));

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
                const key = `${c.courseId}::${c.professorId}::${c.term.shortName}`;
                return !dismissedSet.has(key) && !reviewedSet.has(key);
            });

            if (eligible.length === 0) {
                return;
            }

            const candidate = eligible[Math.floor(Math.random() * eligible.length)];
            set({ step: 'enrollment-confirm', candidate, rating: 0, difficulty: 0, selectedTags: [], textReview: '' });
            logAnalytics(postHog, {
                category: analyticsEnum.review,
                action: analyticsEnum.review.actions.PROMPT_SHOWN,
                customProps: {
                    courseId: candidate.courseId,
                    courseTitle: candidate.courseTitle,
                    professorId: candidate.professorId,
                    term: candidate.term.shortName,
                },
            });
        },

        confirm: () => {
            const { candidate } = get();
            set({ step: 'review' });
            if (candidate) {
                logAnalytics(postHog, {
                    category: analyticsEnum.review,
                    action: analyticsEnum.review.actions.ENROLLMENT_CONFIRMED,
                    customProps: {
                        courseId: candidate.courseId,
                        professorId: candidate.professorId,
                        term: candidate.term.shortName,
                    },
                });
            }
        },

        /**
         * User closed the prompt without submitting (X, Skip, "I did not", snackbar click-away, Escape).
         * Updates local state and logs analytics. The caller is responsible for firing the dismissReview
         * mutation so the combo is not suggested again and the cooldown window starts.
         */
        dismiss: () => {
            const { candidate, step } = get();
            set({ step: 'hidden', candidate: null, rating: 0, difficulty: 0, selectedTags: [], textReview: '' });
            if (candidate) {
                logAnalytics(postHog, {
                    category: analyticsEnum.review,
                    action: analyticsEnum.review.actions.DISMISSED,
                    customProps: {
                        courseId: candidate.courseId,
                        professorId: candidate.professorId,
                        term: candidate.term.shortName,
                        dismissedAtStep: step,
                    },
                });
            }
            return candidate;
        },

        setRating: (rating: number) => set({ rating }),

        setDifficulty: (difficulty: number) => set({ difficulty }),

        setTextReview: (textReview: string) => set({ textReview }),

        toggleTag: (tag: ReviewTag) => {
            const { selectedTags } = get();
            set({
                selectedTags: selectedTags.includes(tag)
                    ? selectedTags.filter((t) => t !== tag)
                    : [...selectedTags, tag],
            });
        },

        resetReview: () =>
            set({ step: 'hidden', candidate: null, rating: 0, difficulty: 0, selectedTags: [], textReview: '' }),
    }))
);
