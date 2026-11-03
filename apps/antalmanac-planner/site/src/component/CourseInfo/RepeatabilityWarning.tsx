import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import type { EnrollmentCredit } from '../../helpers/repeatability';

export default function RepeatabilityWarning({ credit }: { credit: EnrollmentCredit }) {
    if (!credit.overLimit) return null;
    let explanation = 'This enrollment does not count for credit.';
    if (credit.countsForCredit === true) explanation = 'This enrollment counts because you explicitly included it.';
    else if (credit.creditedUnits > 0)
        explanation = `Only ${credit.creditedUnits} of ${credit.units} units count for credit.`;
    return (
        <p className="course-repeat-warning" role="status">
            <WarningAmberIcon fontSize="small" />
            <span>Repeat credit limit exceeded. {explanation}</span>
        </p>
    );
}
