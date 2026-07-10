'use client';
import './ReviewCard.scss';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Chip, Tooltip } from '@mui/material';
import {
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Skeleton,
} from '@mui/material';
import { type ReviewData } from '@packages/planner-types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';

import { displayReviewDate, formatQuarter, getProfessorTerms } from '../../helpers/reviews';
import { createTooltipOffset } from '../../helpers/slotProps';
import { sortTerms } from '../../helpers/util';
import { useIsLoggedIn } from '../../hooks/isLoggedIn';
import { useProfessorData } from '../../hooks/professorReviews';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectReviews, setReviews } from '../../store/slices/reviewSlice';
import trpc from '../../trpc';
import { type CourseGQLData, type ProfessorGQLData } from '../../types/types';
import ReportForm from '../ReportForm/ReportForm';
import ReviewForm from '../ReviewForm/ReviewForm';

interface AuthorEditButtonsProps {
    review: ReviewData;
    course?: CourseGQLData;
    professor?: ProfessorGQLData;
}

const ThreeDotsMenu: FC<AuthorEditButtonsProps> = ({ review, course, professor }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reportFormOpen, setReportFormOpen] = useState(false);
    const open = Boolean(anchorEl);

    const dispatch = useAppDispatch();
    const reviewData = useAppSelector(selectReviews);

    const sortedTerms: string[] = sortTerms(course?.terms || (professor ? getProfessorTerms(professor) : []));

    const pathname = usePathname();
    const isAdmin = useAppSelector((state) => state.user.isAdmin);
    const isAdminVerifyPage = pathname === '/planner/admin/verify';

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const deleteReview = async (reviewId: number) => {
        await trpc.reviews.delete.mutate({ id: reviewId });
        dispatch(setReviews(reviewData.filter((review) => review.id !== reviewId)));
        setShowDeleteModal(false);
    };

    const openReviewForm = () => {
        setShowReviewForm(true);
        handleMenuClose();
        document.body.style.overflow = 'hidden';
    };

    const closeReviewForm = () => {
        setShowReviewForm(false);
        document.body.style.overflow = 'visible';
    };

    const openReportForm = () => {
        setReportFormOpen(true);
        handleMenuClose();
    };

    const verifyReview = async (reviewId: number) => {
        await trpc.reviews.verify.mutate({ id: reviewId });
        dispatch(setReviews(reviewData.filter((review) => review.id !== reviewId)));
        handleMenuClose();
    };

    const adminDeleteReview = async (reviewId: number) => {
        await trpc.reviews.delete.mutate({ id: reviewId });
        dispatch(setReviews(reviewData.filter((review) => review.id !== reviewId)));
        handleMenuClose();
    };

    return (
        <>
            <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} className="review-menu">
                <MenuItem onClick={openReportForm}>Report</MenuItem>
                {isAdmin && isAdminVerifyPage && (
                    <MenuItem onClick={() => verifyReview(review.id!)}>Admin: Verify</MenuItem>
                )}
                {isAdmin && isAdminVerifyPage && (
                    <MenuItem onClick={() => adminDeleteReview(review.id)}>Admin: Delete</MenuItem>
                )}
                {review.authored && <MenuItem onClick={openReviewForm}>Edit</MenuItem>}
                {review.authored && (
                    <MenuItem
                        onClick={() => {
                            setShowDeleteModal(true);
                            handleMenuClose();
                        }}
                    >
                        Delete
                    </MenuItem>
                )}
            </Menu>

            <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} fullWidth>
                <DialogTitle>Delete Review</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Deleting a review will remove it permanently. Are you sure you want to proceed?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button color="error" onClick={() => deleteReview(review.id)}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ReviewForm
                course={course}
                professor={professor}
                reviewToEdit={review}
                handleClose={closeReviewForm}
                open={showReviewForm}
                editing
                terms={sortedTerms}
            />

            <ReportForm
                showForm={reportFormOpen}
                reviewId={review.id}
                reviewContent={review.content}
                closeForm={() => setReportFormOpen(false)}
            />
        </>
    );
};

interface ReviewCardProps {
    review: ReviewData;
    course?: CourseGQLData;
    professor?: ProfessorGQLData;
    children?: ReactNode;
}

const ReviewCard: FC<ReviewCardProps> = ({ review, course, professor }) => {
    const dispatch = useAppDispatch();
    const reviewData = useAppSelector(selectReviews);
    const isLoggedIn = useIsLoggedIn();
    const [identifier, setIdentifier] = useState<ReactNode>(null);
    const [loadingIdentifier, setLoadingIdentifier] = useState<boolean>(true);
    const profCache = useProfessorData(review.professorId);
    const router = useRouter();

    const fetchCourseAndProfName = useCallback(async () => {
        let profName: string | undefined = undefined;
        let courseName: string | undefined = undefined;

        try {
            // if cache does not need to be loaded/is empty
            if (!profCache) {
                return;
            }
            const nameParts = profCache.name.split(' ');
            const profInitial = nameParts[0][0] + '.';
            const profLastName = nameParts[nameParts.length - 1];
            profName = `${profInitial} ${profLastName}`;

            const matchedCourse = profCache.courses[review.courseId];

            // first, try to match a course name using the professor's API course array. otherwise, lookup the course separately.
            if (matchedCourse) {
                courseName = `${matchedCourse.department} ${matchedCourse.courseNumber}`;
            } else {
                try {
                    const courseResponse = await trpc.courses.get.query({ courseID: review.courseId });
                    courseName = `${courseResponse.department} ${courseResponse.courseNumber}`;
                } catch (error) {
                    console.error('Error fetching course name: ', error);
                }
            }
            return { courseName, profName };
        } catch (error) {
            console.error('Error fetching professor or course name:', error);
        }
    }, [review.courseId, profCache]);

    const pathname = usePathname();
    const isStandalonePage = pathname !== '/' && pathname !== '/planner';
    const handleLinkClick = useCallback(
        (event: React.MouseEvent, id: string) => {
            if (isStandalonePage) return;
            event.preventDefault();
            if (course) {
                router.push(`?instructor=${encodeURIComponent(id)}`);
            } else {
                router.push(`?course=${encodeURIComponent(id)}`);
            }
        },
        [isStandalonePage, course, router]
    );

    useEffect(() => {
        // if loading then return
        if (!profCache) {
            return;
        }

        const getIdentifier = async () => {
            setLoadingIdentifier(true);

            if (professor) {
                const foundCourse = professor.courses[review.courseId];
                const courseName = foundCourse
                    ? `${foundCourse.department} ${foundCourse.courseNumber}`
                    : review.courseId;
                const courseLink = (
                    <span>
                        <Link
                            href={{ pathname: `/planner/course/${encodeURIComponent(review.courseId)}` }}
                            onClick={(e) => handleLinkClick(e, review.courseId)}
                        >
                            {courseName}
                        </Link>
                        {' • '}
                        {formatQuarter(review.quarter)}
                    </span>
                );
                setIdentifier(courseLink);
            } else if (course) {
                const foundProf = course.instructors[review.professorId];
                const profName = foundProf ? `${foundProf.name}` : review.professorId;
                const profLink = (
                    <span>
                        <Link
                            href={{ pathname: `/planner/instructor/${review.professorId}` }}
                            onClick={(e) => handleLinkClick(e, review.professorId)}
                        >
                            {profName}
                        </Link>
                        {' • '}
                        {formatQuarter(review.quarter)}
                    </span>
                );
                setIdentifier(profLink);
            } else {
                const foundCourseAndProfName = await fetchCourseAndProfName();
                const courseName = foundCourseAndProfName?.courseName ?? review.courseId;
                const profName = foundCourseAndProfName?.profName ?? review.professorId;
                const courseAndProfLink = (
                    <span>
                        <Link href={{ pathname: `/planner/course/${encodeURIComponent(review.courseId)}` }}>
                            {courseName}
                        </Link>
                        {' • '}
                        <Link href={{ pathname: `/planner/instructor/${review.professorId}` }}>
                            {profName ?? review.professorId}
                        </Link>
                        {' • '}
                        {formatQuarter(review.quarter)}
                    </span>
                );
                setIdentifier(courseAndProfLink);
            }
            setLoadingIdentifier(false);
        };

        getIdentifier();
    }, [
        course,
        review.courseId,
        review.quarter,
        professor,
        review.professorId,
        fetchCourseAndProfName,
        profCache,
        handleLinkClick,
    ]);

    const updateScore = (newUserVote: number) => {
        dispatch(
            setReviews(
                reviewData.map((otherReview) => {
                    if (otherReview.id === review.id) {
                        const prevVote = otherReview.userVote!;
                        return {
                            ...otherReview,
                            score: otherReview.score + (newUserVote - prevVote),
                            upvotes: otherReview.upvotes + (newUserVote === 1 ? 1 : 0) - (prevVote === 1 ? 1 : 0),
                            downvotes: otherReview.downvotes + (newUserVote === -1 ? 1 : 0) - (prevVote === -1 ? 1 : 0),
                            userVote: newUserVote,
                        };
                    } else {
                        return otherReview;
                    }
                })
            )
        );
    };

    const upvote = async () => {
        const newVote = review.userVote === 1 ? 0 : 1;
        await vote(newVote);
    };

    const downvote = async () => {
        const newVote = review.userVote === -1 ? 0 : -1;
        await vote(newVote);
    };

    const vote = async (newVote: number) => {
        updateScore(newVote);
        try {
            await trpc.reviews.vote.mutate({ id: review.id, vote: newVote });
        } catch (err) {
            updateScore(review.userVote);
            console.error('Error sending downvote:', err);
        }
    };

    const tooltipProps = {
        placement: 'top' as const,
        slotProps: createTooltipOffset(0, -10),
    };

    const verifiedIcon = (
        <Tooltip title="This review was verified by an administrator." {...tooltipProps}>
            <VerifiedUserIcon />
        </Tooltip>
    );

    const authorIcon = (
        <Tooltip title="You are the author of this review." {...tooltipProps}>
            <PersonIcon />
        </Tooltip>
    );

    const tags: string[] = review.tags?.slice() ?? [];
    if (review.textbook) tags.unshift('Requires textbook');
    if (review.attendance) tags.unshift('Mandatory attendance');

    return (
        <Card variant="outlined" className="reviewcard">
            <div className="reviewcard-header">
                <div className="reviewcard-header-top">
                    <h3 className="reviewcard-identifier">
                        {loadingIdentifier ? <Skeleton variant="text" animation="wave" width={210} /> : identifier}
                    </h3>
                    <ThreeDotsMenu review={review} course={course} professor={professor} />
                </div>
                <Divider />
                <div className="reviewcard-header-bottom">
                    <div className="reviewcard-author">
                        <span className="reviewcard-author-name">{review.userDisplay}</span>
                        {review.verified && <div className="reviewcard-author-icon">{verifiedIcon}</div>}
                        {review.authored && <div className="reviewcard-author-icon">{authorIcon}</div>}
                    </div>
                    <span className="reviewcard-date">
                        {displayReviewDate(review.createdAt)}
                        {review.updatedAt && (
                            <span className="subtext edit-time"> (edited {displayReviewDate(review.updatedAt)})</span>
                        )}
                    </span>
                </div>
            </div>

            <div className="reviewcard-content">
                <div className="reviewcard-ratings">
                    <div className="rating rating-quality">
                        <div className="rating-label">Quality</div>
                        <div className="rating-value">{review.rating}</div>
                    </div>
                    <div className="rating rating-difficulty">
                        <div className="rating-label">Difficulty</div>
                        <div className="rating-value">{review.difficulty}</div>
                    </div>
                </div>
                <div className="reviewcard-info">
                    <p>
                        Grade: <b>{review.gradeReceived ?? 'Prefer not to say'}</b>
                    </p>
                    <p className="review-content">{review.content || <i>This review has no additional content</i>}</p>
                </div>
            </div>
            <div className="reviewcard-footer-row">
                {tags.length > 0 && (
                    <div className="reviewcard-tags">
                        {tags.map((tag) => (
                            <Chip size="small" key={tag} label={tag} />
                        ))}
                    </div>
                )}
                <div className="reviewcard-footer" id={review.id.toString()}>
                    <div className="reviewcard-voting-buttons">
                        <Tooltip title="You must be logged in to vote" open={isLoggedIn ? false : undefined}>
                            <span className={`upvote${review.userVote === 1 ? ' colored-vote' : ''}`}>
                                <span className="vote-count">{review.upvotes}</span>
                                <IconButton
                                    onClick={upvote}
                                    disabled={!isLoggedIn}
                                    size="small"
                                    style={{
                                        color:
                                            review.userVote === 1 ? 'var(--planner-palette-secondary-main)' : undefined,
                                    }}
                                >
                                    {review.userVote === 1 ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="You must be logged in to vote" open={isLoggedIn ? false : undefined}>
                            <span className={`downvote${review.userVote === -1 ? ' colored-vote' : ''}`}>
                                <span className="vote-count">{review.downvotes}</span>
                                <IconButton
                                    onClick={downvote}
                                    disabled={!isLoggedIn}
                                    size="small"
                                    style={{
                                        color:
                                            review.userVote === -1
                                                ? 'var(--planner-palette-secondary-main)'
                                                : undefined,
                                    }}
                                >
                                    {review.userVote === -1 ? <ThumbDownIcon /> : <ThumbDownOffAltIcon />}
                                </IconButton>
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ReviewCard;
