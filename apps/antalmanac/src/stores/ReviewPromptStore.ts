import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpc } from '$lib/api/trpc';
import { type AATerm, termData } from '$lib/term';
import { postHog } from '$providers/PostHog';
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

type ReviewTag = (typeof REVIEW_TAGS)[number];

type ReviewCandidate = {
    /** e.g. "ICS 31" */
    courseId: string;
    courseTitle: string;
    /** Raw WebSOC instructor name, e.g. "PATTIS, R." */
    professorId: string;
    term: AATerm;
};

type Step = 'enrollment-confirm' | 'review' | 'success' | 'hidden';

const VALID_TRANSITIONS: Record<Step, ReadonlySet<Step>> = {
    hidden: new Set(['enrollment-confirm']),
    'enrollment-confirm': new Set(['review', 'hidden']),
    review: new Set(['success', 'hidden']),
    success: new Set(['enrollment-confirm', 'hidden']),
};

const PAST_TERMS_WINDOW = 4;

/** Min time between review prompts after the user last dismissed, skipped, or submitted. */
const REVIEW_PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const initialState = {
    candidate: null as ReviewCandidate | null,
    eligibleCandidates: [] as ReviewCandidate[],
    eligibleIndex: 0,
    step: 'hidden' as Step,
    rating: 0,
    difficulty: 0,
    selectedTags: [] as ReviewTag[],
    textReview: '',
};

// `step` is excluded — each callsite passes the target step explicitly to toStep().
const { step: _step, ...RESET_STATE } = initialState;

export const useReviewPromptStore = create(
    combine(initialState, (set, get) => {
        const toStep = (next: Step, updates: Partial<typeof initialState> = {}) => {
            const { step } = get();
            if (!VALID_TRANSITIONS[step].has(next)) {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn(`[ReviewPrompt] Invalid transition: ${step} → ${next}`);
                }
                return;
            }
            set({ step: next, ...updates });
        };

        return {
            /**
             * Find a candidate course from the user's schedule history and surface the prompt.
             * Should be called once after the session is confirmed valid.
             */
            initPrompt: async () => {
                const today = new Date();

                // Collect past terms within the window (termData is ordered newest-first
                // after the filter in term.ts — see its `filter(socAvailable <= today)`).
                // We further filter to terms whose finals have already ended.
                const pastTermNames = new Set<string>(
                    termData
                        .filter((t) => t.finalsStart < today)
                        .slice(0, PAST_TERMS_WINDOW)
                        .map((t) => t.shortName)
                );

                if (pastTermNames.size === 0) return;

                const allCourses = AppStore.schedule.getAllCourses();
                const courseGroups = new Map<string, (typeof allCourses)[number][]>();

                for (const course of allCourses) {
                    const term = course.term;
                    if (!pastTermNames.has(term.shortName)) {
                        continue;
                    }

                    const sectionType = course.section.sectionType;
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
                    const dedupKey = `${courseId}::${instructor}::${term.shortName}`;
                    const group = courseGroups.get(dedupKey);
                    if (group) {
                        group.push(course);
                    } else {
                        courseGroups.set(dedupKey, [course]);
                    }
                }

                const candidates: ReviewCandidate[] = [];
                for (const courses of courseGroups.values()) {
                    const picked = courses.find((c) => c.section.sectionType === 'Lec') ?? courses.at(0);
                    const instructor = picked?.section.instructors.at(0)?.trim();
                    if (!instructor || !picked) {
                        continue;
                    }

                    candidates.push({
                        courseId: `${picked.deptCode} ${picked.courseNumber}`,
                        courseTitle: picked.courseTitle,
                        professorId: instructor,
                        term: picked.term,
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

                if (eligible.length === 0) return;

                const shuffled = [...eligible];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                const first = shuffled[0];
                toStep('enrollment-confirm', { ...RESET_STATE, candidate: first, eligibleCandidates: shuffled });
                logAnalytics(postHog, {
                    category: analyticsEnum.review,
                    action: analyticsEnum.review.actions.PROMPT_SHOWN,
                    customProps: {
                        courseId: first.courseId,
                        courseTitle: first.courseTitle,
                        professorId: first.professorId,
                        term: first.term.shortName,
                    },
                });
            },

            confirm: () => {
                const { candidate } = get();
                toStep('review');
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
                toStep('hidden', RESET_STATE);
                if (candidate && step !== 'success') {
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

            resetReview: () =>
                set({
                    step: 'hidden',
                    candidate: null,
                    eligibleCandidates: [],
                    eligibleIndex: 0,
                    rating: 0,
                    difficulty: 0,
                    selectedTags: [],
                    textReview: '',
                }),

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

            submitReview: async () => {
                const { candidate, rating, difficulty, selectedTags, textReview } = get();
                if (!candidate || rating === 0 || difficulty === 0) return;

                const trimmedReview = textReview.trim();

                try {
                    await trpc.review.submitReview.mutate({
                        professorId: candidate.professorId,
                        courseId: candidate.courseId,
                        termShortName: candidate.term.shortName,
                        rating,
                        difficulty,
                        tags: selectedTags,
                        content: trimmedReview || undefined,
                    });
                    toStep('success', { rating: 0, difficulty: 0, selectedTags: [], textReview: '' });
                    logAnalytics(postHog, {
                        category: analyticsEnum.review,
                        action: analyticsEnum.review.actions.SUBMITTED,
                        customProps: {
                            courseId: candidate.courseId,
                            professorId: candidate.professorId,
                            term: candidate.term.shortName,
                            rating,
                            difficulty,
                            tags: selectedTags,
                        },
                    });
                } catch {
                    openSnackbar('error', 'Failed to submit review. Please try again.');
                }
            },

            advanceToNext: () => {
                const { eligibleCandidates, eligibleIndex } = get();
                const nextIndex = eligibleIndex + 1;
                const next = eligibleCandidates[nextIndex];
                if (!next) {
                    toStep('hidden', RESET_STATE);
                    return;
                }
                toStep('enrollment-confirm', {
                    ...RESET_STATE,
                    candidate: next,
                    eligibleCandidates,
                    eligibleIndex: nextIndex,
                });
                logAnalytics(postHog, {
                    category: analyticsEnum.review,
                    action: analyticsEnum.review.actions.REVIEW_ANOTHER_CLICKED,
                    customProps: {
                        courseId: next.courseId,
                        professorId: next.professorId,
                        term: next.term.shortName,
                    },
                });
            },

            finishReviewing: () => {
                toStep('hidden', RESET_STATE);
                openSnackbar('success', 'Review submitted — thanks for helping other Anteaters!');
                logAnalytics(postHog, {
                    category: analyticsEnum.review,
                    action: analyticsEnum.review.actions.REVIEW_DONE_CLICKED,
                });
            },
        };
    })
);
