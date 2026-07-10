import trpc from '$planner/trpc';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Button, Card } from '@mui/material';

import './ReportGroup.scss';
import { type ReportGroupData, type ReviewData } from '@packages/planner-types';
import { type FC, useEffect, useState } from 'react';

interface SubReportProps {
    reason: string;
    timestamp: string;
}

const SubReport: FC<SubReportProps> = ({ reason, timestamp }) => {
    const date = new Date(Date.parse(timestamp));
    const dateText = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    return (
        <Card variant="outlined" className="subreport">
            <b>Reason for Report on {dateText}</b>
            <i>{reason}</i>
        </Card>
    );
};

interface ReportGroupProps {
    reportGroup: ReportGroupData;
    onAccept: () => void;
    onDeny: () => void;
}

const ReportGroup: FC<ReportGroupProps> = ({ reportGroup, onAccept, onDeny }) => {
    const [review, setReview] = useState<ReviewData>(null!);

    const getReviewData = async (reviewId: number) => {
        const reviews = await trpc.reviews.getAdminView.query({ reviewId });
        setReview(reviews[0]);
    };

    useEffect(() => {
        getReviewData(reportGroup.reviewId);
    }, [reportGroup.reviewId]);

    if (!review) {
        return null;
    }

    const reviewCreationDate = new Date(review.createdAt).toLocaleString('default', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Card variant="outlined" className="report-group">
            <div className="report-group-header">
                <h3 className="report-group-identifier">
                    {review.courseId} {review.professorId}
                </h3>
                <div className="edit-buttons">
                    <Button color="inherit" onClick={onDeny} startIcon={<PersonRemoveIcon />}>
                        Ignore
                    </Button>
                    <Button onClick={onAccept} startIcon={<DeleteIcon />}>
                        Accept Report
                    </Button>
                </div>
            </div>
            <div className="report-group-content">{review.content}</div>
            <div className="report-group-user-display">
                Posted by <i>{review.userDisplay}</i> on <i>{reviewCreationDate}</i>
            </div>
            <div className="report-group-subreports-container">
                {reportGroup.reports.map((report) => (
                    <SubReport key={report.id} reason={report.reason} timestamp={report.createdAt} />
                ))}
            </div>
        </Card>
    );
};

export default ReportGroup;
