import { Button, Checkbox, FormControlLabel } from '@mui/material';
import type { CourseEnrollmentState } from '@peterportal/types';

interface EnrollmentStateControlsProps {
    state: CourseEnrollmentState;
    onChange: (changes: CourseEnrollmentState) => void;
    automaticCountsForCredit?: boolean;
}

/** Functional placeholder controls pending the UI/UX design. */
export default function EnrollmentStateControls({
    state,
    onChange,
    automaticCountsForCredit = true,
}: EnrollmentStateControlsProps) {
    return (
        <details className="course-enrollment-state">
            <summary>Enrollment settings</summary>
            <FormControlLabel
                label="Counts for credit"
                control={
                    <Checkbox
                        size="small"
                        checked={state.countsForCredit ?? automaticCountsForCredit}
                        onChange={(_event, countsForCredit) => onChange({ countsForCredit })}
                    />
                }
            />
            {state.countsForCredit === undefined ? (
                <small>Using course rules</small>
            ) : (
                <Button size="small" color="inherit" onClick={() => onChange({ countsForCredit: undefined })}>
                    Use course rules
                </Button>
            )}
        </details>
    );
}
