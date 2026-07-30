import { ReviewData, ReviewTags } from '@peterportal/types';
import { FC, useState } from 'react';
import { Card, CardContent, LinearProgress } from '@mui/material';
import './MostUsedTags.scss';
import ClickableDiv from '../ClickableDiv/ClickableDiv';

interface CommonFeedbackProps {
    reviews: ReviewData[];
}

const CommonFeedback: FC<CommonFeedbackProps> = ({ reviews }) => {
    const [showAll, setShowAll] = useState(false);

    const tagCounts = new Map<ReviewTags, number>();
    reviews.forEach((review) => review.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)));

    const tagStats = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([tag, count]) => ({ label: tag, count }));

    const maxCount = tagStats[0]?.count ?? 1;

    const visibleStats = showAll ? tagStats : tagStats.slice(0, 3);

    return (
        <div className="most-used-tags">
            <div className="most-used-tags-header">
                <h2>Most Used Tags</h2>
                <p className="num-reviews">{reviews.length} reviews</p>
            </div>
            <Card variant="outlined">
                <CardContent className="most-used-tags-bars">
                    {visibleStats.map(({ label, count }) => (
                        <div key={label} className="most-used-tags-bar">
                            <div className="bar-label">
                                <p>{label}</p>
                                <p>{count}</p>
                            </div>
                            <LinearProgress color="secondary" variant="determinate" value={(count / maxCount) * 100} />
                        </div>
                    ))}
                </CardContent>
            </Card>
            {tagStats.length > 3 && (
                <ClickableDiv className="view-more-btn" onClick={() => setShowAll((prev) => !prev)}>
                    {showAll ? 'View less' : 'View more'}
                </ClickableDiv>
            )}
        </div>
    );
};

export default CommonFeedback;
