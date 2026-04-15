import React, { FC, useState } from 'react';
import './ReportForm.scss';
import trpc from '../../trpc';
import { ReportSubmission } from '@peterportal/types';
import Toast, { ToastSeverity } from '../../helpers/toast';
import { Button, Box, FormLabel, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface ReportFormProps {
  showForm: boolean;
  reviewId: number;
  reviewContent: string | undefined;
  closeForm: () => void;
}

const ReportForm: FC<ReportFormProps> = (props) => {
  const [reason, setReason] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<ToastSeverity>('info');

  const handleClose = () => {
    setShowToast(false);
  };

  const postReport = async (report: ReportSubmission) => {
    setBusy(true);
    try {
      await trpc.reports.add.mutate(report);
      setToastMsg('Your report has been submitted successfully');
      setToastSeverity('success');
      setShowToast(true);
      props.closeForm();
    } catch {
      setToastMsg('Unable to submit review');
      setToastSeverity('error');
      setShowToast(true);
    } finally {
      setBusy(false);
    }
  };

  const submitReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reason.length === 0) {
      setToastMsg('Report reason must not be empty');
      setToastSeverity('error');
      setShowToast(true);
      return;
    }

    const report = { reviewId: props.reviewId, reason };
    postReport(report);
  };

  return (
    <Dialog className="report-form" open={props.showForm} onClose={props.closeForm} fullWidth>
      <DialogTitle>Report Review</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate onSubmit={submitReport} id="report-form">
          <FormLabel>Review Content</FormLabel>
          <p className="reported-review-content">
            <i>
              {props.reviewContent?.length
                ? props.reviewContent
                : 'No additional content was provided for this review.'}
            </i>
          </p>

          <FormLabel>Why are you reporting this review?</FormLabel>

          <TextField
            variant="outlined"
            placeholder="Enter a reason..."
            multiline
            slotProps={{
              htmlInput: {
                minLength: 1,
                maxLength: 500,
              },
            }}
            onChange={(e) => setReason(e.target.value)}
            value={reason}
            minRows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={props.closeForm}>
          Cancel
        </Button>
        <Button type="submit" form="report-form" disabled={!reason.length} loading={busy}>
          Submit Report
        </Button>
      </DialogActions>
      <Toast text={toastMsg} severity={toastSeverity} showToast={showToast} onClose={handleClose} />
    </Dialog>
  );
};

export default ReportForm;
