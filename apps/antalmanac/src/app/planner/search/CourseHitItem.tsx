'use client';
import ClickableDiv from '$planner/component/ClickableDiv/ClickableDiv';

import './HitItem.scss';
import { CourseSynopsis } from '$planner/component/CourseInfo/CourseInfo';
import RecentOfferingsTooltip from '$planner/component/RecentOfferingsTooltip/RecentOfferingsTooltip';
import { getCourseTags } from '$planner/helpers/util';
import { useSavedCourses } from '$planner/hooks/savedCourses';
import { type CourseGQLData } from '$planner/types/types';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { Chip, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { type FC } from 'react';

interface CourseHitItemProps extends CourseGQLData {}

const CourseHitItem: FC<CourseHitItemProps> = (props) => {
    const router = useRouter();
    const { saveCourse, unsaveCourse, isCourseSaved } = useSavedCourses();
    const courseIsSaved = isCourseSaved(props);
    const pillData = getCourseTags(props); // data to be displayed in pills

    const onClickName = () => {
        router.push(`?course=${encodeURIComponent(props.id)}`);
    };

    const toggleSaveCourse = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (courseIsSaved) {
            unsaveCourse(props);
        } else if (props && props.id) {
            saveCourse(props);
        }
    };

    return (
        <ClickableDiv className="hit-item course-hit" onClick={onClickName}>
            <div className="course-hit-id">
                <div>
                    <p className="hit-name">
                        {props.department} {props.courseNumber}
                    </p>
                    <IconButton onClick={toggleSaveCourse} size="small">
                        {courseIsSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                </div>
            </div>

            <div>
                <CourseSynopsis course={props} clampDescription={4} />
                <div className="hit-previous-terms">
                    <b>Past Offerings:</b>
                    <div className="hit-tooltip">
                        <RecentOfferingsTooltip terms={props.terms} />
                    </div>
                </div>
                <div className="hit-badges">
                    {pillData.map((pill, i) => (
                        <Chip key={`course-hit-item-pill-${i}`} color="primary" size="small" label={pill} />
                    ))}
                </div>
            </div>
        </ClickableDiv>
    );
};

export default CourseHitItem;
