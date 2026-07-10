import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    MenuItem,
    Select,
    Slider,
    Switch,
    TextField,
} from '@mui/material';
import {
    type EditReviewSubmission,
    type ReviewData,
    type ReviewGrade,
    type ReviewSubmission,
    type ReviewTags,
    anonymousName,
    grades,
    tags,
} from '@packages/planner-types';
import React, { type FC, useEffect, useState } from 'react';

import { getProfessorTerms, getQuarters, getReviewHeadingName, getYears } from '../../helpers/reviews';

import './ReviewForm.scss';
import { searchAPIResult, sortTerms } from '../../helpers/util';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addReview, editReview, setShowToast, setToastMsg, setToastSeverity } from '../../store/slices/reviewSlice';
import trpc from '../../trpc';
import { type ProfessorGQLData } from '../../types/types';
import { type ReviewProps } from '../Review/Review';

interface ReviewFormProps extends ReviewProps {
    open: boolean;
    handleClose: () => void;
    editing?: boolean;
    reviewToEdit?: ReviewData;
}

const ReviewForm: FC<ReviewFormProps> = ({
    open,
    handleClose,
    editing,
    reviewToEdit,
    professor: professorProp,
    course: courseProp,
    terms: termsProp,
}) => {
    const dispatch = useAppDispatch();
    const reviews = useAppSelector((state) => state.review.reviews);
    const reviewHeadingName = getReviewHeadingName(reviewToEdit, courseProp, professorProp);

    const [terms, setTerms] = useState(termsProp ?? []);
    const [instructorName, setInstructorName] = useState(professorProp?.name ?? '');
    const [anonymous, setAnonymous] = useState(reviewToEdit?.userDisplay === anonymousName);
    const [yearTakenDefault, quarterTakenDefault] = reviewToEdit?.quarter.split(' ') ?? ['', ''];
    const [yearTaken, setYearTaken] = useState(yearTakenDefault);
    const [quarterTaken, setQuarterTaken] = useState(quarterTakenDefault);
    const [instructor, setInstructor] = useState(professorProp?.ucinetid ?? reviewToEdit?.professorId ?? '');
    const [course, setCourse] = useState(courseProp?.id ?? reviewToEdit?.courseId ?? '');
    const [gradeReceived, setGradeReceived] = useState<ReviewGrade | undefined>(
        reviewToEdit?.gradeReceived ?? undefined
    );

    const [selectedTags, setSelectedTags] = useState<ReviewTags[]>([]);
    const handleTagChange = (tag: ReviewTags) => {
        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    };

    const [rating, setRating] = useState(reviewToEdit?.rating ?? 3);
    const [difficulty, setDifficulty] = useState(reviewToEdit?.difficulty ?? 3);
    const sliderMarks = [...Array(5).keys()].map((k) => ({ value: k + 1, label: '•' }));

    const [content, setContent] = useState(reviewToEdit?.content ?? '');
    const wordCount = content.match(/\S+/g)?.length ?? 0;

    const [submitting, setSubmitting] = useState(false);
    const [showFormErrors, setShowFormErrors] = useState(false);
    const [professorTermsMap, setProfessorTermsMap] = useState<Record<string, string[]>>({});
    const [availableTermsForProfessor, setAvailableTermsForProfessor] = useState<string[]>([]);
    const [professorCourseTermsMap, setProfessorCourseTermsMap] = useState<Record<string, string[]>>({});

    // on initial load, fetch instructor/course terms
    useEffect(() => {
        const promises: Promise<void>[] = [];

        const parseTerms = (terms: string | string[]): string[] => {
            return Array.isArray(terms) ? terms : terms.split(',').map((t: string) => t.trim());
        };

        const fetchAndBuildTermsMap = async (
            keysToIterate: string[],
            getUcinetid: (key: string) => string,
            getTermsFromData: (data: ProfessorGQLData, key: string) => string | string[] | undefined,
            onComplete: (resultMap: Record<string, string[]>) => void,
            errorLabel: string
        ) => {
            const resultMap: Record<string, string[]> = {};

            await Promise.all(
                keysToIterate.map(async (key) => {
                    try {
                        const ucinetid = getUcinetid(key);
                        const professorData = await searchAPIResult('instructor', ucinetid);
                        const terms = getTermsFromData(professorData!, key);

                        if (terms) {
                            resultMap[key] = parseTerms(terms);
                        }
                    } catch (e) {
                        console.error(`Failed to fetch ${errorLabel} for ${key}:`, e);
                    }
                })
            );
            onComplete(resultMap);
        };

        const fetchEditingInstructor = async (
            instructorId: string,
            courseId: string | undefined,
            setters: {
                setInstructor: (id: string) => void;
                setTerms: (terms: string[]) => void;
                setInstructorName: (name: string) => void;
                setMap: (map: Record<string, string[]>) => void;
            }
        ) => {
            const instructor = await searchAPIResult('instructor', instructorId);
            if (instructor) {
                setters.setTerms(sortTerms(getProfessorTerms(instructor)));
                setters.setInstructorName(instructor.name);
                setters.setInstructor(instructorId);
                if (courseId && instructor?.courses[courseId]?.terms) {
                    setters.setMap({
                        [instructorId]: parseTerms(instructor.courses[courseId].terms as string | string[]),
                    });
                }
            }
        };

        // course context — fetch all instructors' terms for this course
        if (courseProp) {
            promises.push(
                fetchAndBuildTermsMap(
                    Object.keys(courseProp.instructors),
                    (ucinetid) => ucinetid,
                    (data) => data?.courses[courseProp.id]?.terms,
                    setProfessorTermsMap,
                    'instructor'
                )
            );
        }

        // professor context — fetch all courses' terms for this professor
        if (professorProp) {
            promises.push(
                fetchAndBuildTermsMap(
                    Object.keys(professorProp.courses),
                    () => professorProp.ucinetid,
                    (data, courseId) => data?.courses[courseId]?.terms,
                    setProfessorCourseTermsMap,
                    'course'
                )
            );
        }

        // editing without context — fetch the review's instructor's terms
        if (reviewToEdit && !courseProp && !professorProp) {
            promises.push(
                fetchEditingInstructor(reviewToEdit.professorId, reviewToEdit.courseId, {
                    setInstructor,
                    setTerms,
                    setInstructorName,
                    setMap: setProfessorTermsMap,
                })
            );
        }

        // editing in course context - pre-select the instructor and fetch their terms
        if (reviewToEdit && courseProp && !professorProp) {
            setInstructor(reviewToEdit.professorId);
            promises.push(
                fetchEditingInstructor(reviewToEdit.professorId, courseProp.id, {
                    setInstructor,
                    setTerms,
                    setInstructorName,
                    setMap: setProfessorTermsMap,
                })
            );
        }

        Promise.all(promises).catch(console.error);
    }, [courseProp, professorProp, reviewToEdit]);

    // when instructor, course, or their terms data changes, determine which terms to show in the dropdown
    useEffect(() => {
        const uniqueTermsSorted = (chosenMap: Record<string, string[]>): string[] => {
            const termsFromMap = Object.values(chosenMap).flat();
            const allTerms = new Set(termsFromMap);
            return Array.from(allTerms).sort();
        };

        let termsToUse: string[] = [];
        if (courseProp && (instructor || Object.keys(professorTermsMap).length > 0)) {
            termsToUse = uniqueTermsSorted(professorTermsMap);
        } else if (professorProp && course) {
            termsToUse = uniqueTermsSorted(professorCourseTermsMap);
        } else if (reviewToEdit && !courseProp && !professorProp) {
            // personal context: show only terms for this specific instructor + course
            termsToUse = professorTermsMap[reviewToEdit.professorId] ?? [];
        }
        // fallback
        else {
            termsToUse = terms;
        }

        setAvailableTermsForProfessor(termsToUse);
    }, [
        instructor,
        course,
        courseProp,
        professorProp,
        professorTermsMap,
        professorCourseTermsMap,
        terms,
        reviewToEdit,
    ]);

    // if the instructor or course is invalid for the selected year + quarter, clear the selection and show only valid options
    useEffect(() => {
        if (!yearTaken) return;

        // determine valid quarter
        let newQuarter = quarterTaken;
        if (availableTermsForProfessor.length > 0) {
            const validQuarters = getQuarters(availableTermsForProfessor, yearTaken);
            if (!validQuarters.includes(quarterTaken)) {
                newQuarter = '';
                setQuarterTaken('');
            }
        }

        // course context: if quarter + year selected but instructor doesn't teach in that term, clear instructor selection
        if (courseProp && instructor) {
            const taughtInYearQuarter = (professorTermsMap[instructor] ?? []).some(
                (term) => term.startsWith(yearTaken) && (newQuarter === '' || term.includes(newQuarter))
            );
            if (!taughtInYearQuarter) {
                setInstructor('');
            }
        }

        // professor context: if quarter + year selected but course doesn't have that term for this professor, clear course selection
        if (professorProp && course && Object.keys(professorCourseTermsMap).length > 0) {
            const taughtInYearQuarter = (professorCourseTermsMap[course] ?? []).some(
                (term) => term.startsWith(yearTaken) && (newQuarter === '' || term.includes(newQuarter))
            );
            if (!taughtInYearQuarter) {
                setCourse('');
            }
        }
    }, [
        yearTaken,
        availableTermsForProfessor,
        instructor,
        professorTermsMap,
        courseProp,
        course,
        professorCourseTermsMap,
        professorProp,
        quarterTaken,
    ]);

    // clear instructor/course when year changes
    useEffect(() => {
        if (courseProp && instructor && yearTaken) {
            const taughtInYear = (professorTermsMap[instructor] ?? []).some((term) => term.startsWith(yearTaken));
            if (!taughtInYear) {
                setInstructor('');
            }
        }

        if (professorProp && course && yearTaken && Object.keys(professorCourseTermsMap).length > 0) {
            const taughtInYear = (professorCourseTermsMap[course] ?? []).some((term) => term.startsWith(yearTaken));
            if (!taughtInYear) {
                setCourse('');
            }
        }
    }, [yearTaken, instructor, professorTermsMap, courseProp, course, professorCourseTermsMap, professorProp]);

    // restrict year/quarter in personal context
    useEffect(() => {
        if (reviewToEdit && !courseProp && !professorProp && Object.keys(professorTermsMap).length > 0) {
            // get terms for the specific instructor + course combo
            const instructorCourseTerms = professorTermsMap[reviewToEdit.professorId] ?? [];

            if (yearTaken && !instructorCourseTerms.some((term) => term.startsWith(yearTaken))) {
                setYearTaken('');
            }

            if (yearTaken && quarterTaken && !instructorCourseTerms.includes(`${yearTaken} ${quarterTaken}`)) {
                setQuarterTaken('');
            }
        }
    }, [yearTaken, quarterTaken, reviewToEdit, courseProp, professorProp, professorTermsMap]);

    const resetForm = () => {
        setYearTaken(yearTakenDefault);
        setQuarterTaken(quarterTakenDefault);
        setInstructor(professorProp?.ucinetid ?? reviewToEdit?.professorId ?? '');
        setCourse(courseProp?.id ?? reviewToEdit?.courseId ?? '');
        setGradeReceived(reviewToEdit?.gradeReceived);
        setDifficulty(reviewToEdit?.difficulty ?? 3);
        setRating(reviewToEdit?.rating ?? 3);
        setSelectedTags(reviewToEdit?.tags ?? []);
        setContent(reviewToEdit?.content ?? '');
        setAnonymous(reviewToEdit?.userDisplay === anonymousName);
        setShowFormErrors(false);
    };

    const postReview = async (review: ReviewSubmission | EditReviewSubmission) => {
        setSubmitting(true);
        try {
            if (editing) {
                await trpc.reviews.edit.mutate(review as EditReviewSubmission);
                dispatch(editReview(review as EditReviewSubmission));
                dispatch(setToastMsg('Your review has been edited successfully!'));
                dispatch(setToastSeverity('success'));
                dispatch(setShowToast(true));
            } else {
                const res = await trpc.reviews.add.mutate(review);
                dispatch(addReview(res));
                dispatch(setToastMsg('Your review has been submitted successfully!'));
                dispatch(setToastSeverity('success'));
                dispatch(setShowToast(true));
            }
        } catch (e) {
            dispatch(setToastMsg((e as Error).message));
            dispatch(setToastSeverity('error'));
            dispatch(setShowToast(true));
        } finally {
            setSubmitting(false);
        }

        if (!editing) resetForm();
        handleClose();
    };

    const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        const valid = form.checkValidity();
        event.preventDefault();
        event.stopPropagation();

        if (!valid || wordCount > 500) {
            setShowFormErrors(true);
            setSubmitting(false);
            return;
        }

        setSubmitting(true);

        const review = {
            id: reviewToEdit?.id,
            professorId: instructor,
            courseId: course,
            anonymous: anonymous,
            content: content,
            rating: rating,
            difficulty: difficulty,
            gradeReceived: gradeReceived,
            forCredit: true,
            quarter: yearTaken + ' ' + quarterTaken,
            tags: selectedTags,
            updatedAt: editing ? new Date().toISOString() : undefined,
        };

        postReview(review);
    };

    const alreadyReviewedCourseInstr = (courseId: string, professorId: string) => {
        return reviews.some(
            (review) => review.courseId === courseId && review.professorId === professorId && review.authored
        );
    };

    // if in course context, select an instructor
    const instructorSelect = courseProp && (
        <FormControl error={showFormErrors && !instructor}>
            <FormLabel required>Instructor</FormLabel>
            <Select
                required
                error={showFormErrors && !instructor}
                onChange={(e) => setInstructor(e.target.value)}
                value={instructor}
                displayEmpty
            >
                <MenuItem disabled value="">
                    Select instructor
                </MenuItem>
                {Object.keys(courseProp?.instructors).map((ucinetid) => {
                    const name = courseProp?.instructors[ucinetid].name;
                    const alreadyReviewed = alreadyReviewedCourseInstr(courseProp?.id, ucinetid);
                    // check if this instructor taught in the selected term
                    const taughtInSelectedTerm =
                        yearTaken && quarterTaken
                            ? (professorTermsMap[ucinetid] ?? []).includes(`${yearTaken} ${quarterTaken}`)
                            : yearTaken
                              ? (professorTermsMap[ucinetid] ?? []).some((term) => term.startsWith(yearTaken)) // Filter by year only
                              : true; // If no year selected yet, show all
                    return (
                        <MenuItem
                            key={ucinetid}
                            value={ucinetid}
                            title={
                                alreadyReviewed
                                    ? 'You have already reviewed this instructor'
                                    : !taughtInSelectedTerm
                                      ? 'This instructor did not teach this course in the selected term'
                                      : undefined
                            }
                            disabled={alreadyReviewed || !taughtInSelectedTerm}
                        >
                            {name}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );

    // if in instructor context, select a course
    const courseSelect = professorProp && (
        <FormControl error={showFormErrors && !course}>
            <FormLabel required>Course Taken</FormLabel>
            <Select
                required
                error={showFormErrors && !course}
                onChange={(e) => setCourse(e.target.value)}
                value={course}
                displayEmpty
            >
                <MenuItem disabled value="">
                    Select course
                </MenuItem>
                {Object.keys(professorProp?.courses)
                    .filter((courseID) => {
                        if (!yearTaken || !quarterTaken) return true; // Show all if no term selected
                        const courseTerms = professorCourseTermsMap[courseID] ?? [];
                        return courseTerms.includes(`${yearTaken} ${quarterTaken}`);
                    })
                    .map((courseID) => {
                        const name =
                            professorProp?.courses[courseID].department +
                            ' ' +
                            professorProp?.courses[courseID].courseNumber;
                        const alreadyReviewed = alreadyReviewedCourseInstr(courseID, professorProp?.ucinetid);
                        return (
                            <MenuItem
                                key={courseID}
                                value={courseID}
                                title={alreadyReviewed ? 'You have already reviewed this course' : undefined}
                                disabled={alreadyReviewed}
                            >
                                {name}
                            </MenuItem>
                        );
                    })}
            </Select>
        </FormControl>
    );

    const reviewFormContent = (
        <>
            <div className="year-quarter-row">
                <FormControl error={showFormErrors && !yearTaken}>
                    <FormLabel required>Year</FormLabel>
                    <Select
                        required
                        error={showFormErrors && !yearTaken}
                        onChange={(e) => setYearTaken(e.target.value)}
                        value={yearTaken}
                        displayEmpty
                    >
                        <MenuItem disabled value="">
                            Select year
                        </MenuItem>
                        {getYears(availableTermsForProfessor).map((term) => (
                            <MenuItem key={term} value={term}>
                                {term}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl error={showFormErrors && !quarterTaken}>
                    <FormLabel required>Quarter</FormLabel>
                    <Select
                        required
                        error={showFormErrors && !quarterTaken}
                        onChange={(e) => setQuarterTaken(e.target.value)}
                        value={quarterTaken}
                        displayEmpty
                    >
                        <MenuItem disabled value="">
                            Select quarter
                        </MenuItem>
                        {getQuarters(availableTermsForProfessor, yearTaken).map((quarter) => (
                            <MenuItem key={quarter} value={quarter}>
                                {quarter}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            <div className="course-instructor-grade-row">
                {courseProp && instructorSelect}
                {professorProp && courseSelect}

                <FormControl>
                    <FormLabel>Grade Received</FormLabel>
                    <Select
                        onChange={(e) => setGradeReceived(e.target.value ? (e.target.value as ReviewGrade) : undefined)}
                        value={gradeReceived ?? ''}
                        displayEmpty
                    >
                        <MenuItem value="">Prefer not to say</MenuItem>
                        {grades.map((grade) => (
                            <MenuItem key={grade} value={grade}>
                                {grade}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            <div className="rating-sliders">
                <FormControl fullWidth className="quality-slider">
                    <div className="quality-label rating-label">
                        <FormLabel>Quality Rating</FormLabel>
                        <DialogContentText>Overall experience</DialogContentText>
                    </div>

                    <div className="labeled-slider">
                        <div className="slider-value-labels">
                            <span>Poor</span>
                            <span>Excellent</span>
                        </div>

                        <Slider
                            color="secondary"
                            value={rating}
                            onChange={(_, value) => setRating(value as number)}
                            defaultValue={3}
                            min={1}
                            max={5}
                            step={1}
                            marks={sliderMarks}
                        />
                    </div>
                </FormControl>

                <FormControl fullWidth className="difficulty-slider">
                    <div className="difficulty-label rating-label">
                        <FormLabel>Difficulty Level</FormLabel>
                    </div>

                    <div className="labeled-slider">
                        <div className="slider-value-labels">
                            <span>Very Easy</span>
                            <span>Very Hard</span>
                        </div>
                        <Slider
                            color="secondary"
                            value={difficulty}
                            onChange={(_, value) => setDifficulty(value as number)}
                            defaultValue={3}
                            min={1}
                            max={5}
                            step={1}
                            marks={sliderMarks}
                        />
                    </div>
                </FormControl>
            </div>

            <FormControl className="quick-tags">
                <div className="quick-tags-label">
                    <FormLabel>Quick Tags</FormLabel>
                    <DialogContentText>Select all that apply</DialogContentText>
                </div>
                <div className="quick-tags-select">
                    {tags.map((tag) => {
                        const selected = selectedTags.includes(tag);
                        return (
                            <Chip
                                key={tag}
                                label={tag}
                                clickable
                                color={selected ? 'secondary' : 'default'}
                                variant={selected ? 'filled' : 'outlined'}
                                onClick={() => handleTagChange(tag)}
                            />
                        );
                    })}
                </div>
            </FormControl>

            <FormControl className="additional-details" error={wordCount > 500}>
                <FormLabel>Write a Review</FormLabel>
                <TextField
                    multiline
                    variant="outlined"
                    placeholder="Share your experience — what should future students know about this course?"
                    helperText={`${wordCount}/500 words`}
                    onChange={(e) => setContent(e.target.value)}
                    error={wordCount > 500}
                    value={content}
                    minRows={4}
                />
            </FormControl>
        </>
    );

    return (
        <Dialog open={open} onClose={handleClose} className="review-form-dialog">
            <DialogTitle>
                {editing ? `Edit Review for ${reviewHeadingName}` : `Review ${reviewHeadingName}`}
                <DialogContentText>{courseProp?.title}</DialogContentText>
                {editing && (
                    <DialogContentText>{`You are editing your review for ${instructorName}.`}</DialogContentText>
                )}
            </DialogTitle>
            <Box component="form" noValidate onSubmit={submitForm}>
                <DialogContent>{reviewFormContent}</DialogContent>

                <DialogActions>
                    <FormControlLabel
                        className="anonymous-switch"
                        value={anonymous}
                        control={
                            <Switch
                                color="secondary"
                                checked={anonymous}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setAnonymous(event.target.checked);
                                }}
                            />
                        }
                        label="Post Anonymously"
                        labelPlacement="top"
                    />
                    <Button variant="text" color="inherit" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={submitting}>
                        Submit Review
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default ReviewForm;
