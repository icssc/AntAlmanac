import { Box } from '@material-ui/core';
import { WebsocSectionEnrollment } from '@packages/antalmanac-types';

import { SectionTableCell } from '$components/RightPane/SectionTable/cells/section-table-cell';

interface SectionEnrollmentCellProps {
    numCurrentlyEnrolled: WebsocSectionEnrollment;
    maxCapacity: number;

    /**
     * This is a string because sometimes it's "n/a"
     */
    numOnWaitlist: string;

    /**
     * This is a string because numOnWaitlist is a string. I haven't seen this be "n/a" but it seems possible and I don't want it to break if that happens.
     */
    numNewOnlyReserved: string;
}

export function SectionEnrollmentCell(props: SectionEnrollmentCellProps) {
    const { numCurrentlyEnrolled, maxCapacity, numOnWaitlist, numNewOnlyReserved } = props;

    return (
        <SectionTableCell>
            <Box>
                <Box>
                    <strong>
                        {numCurrentlyEnrolled.totalEnrolled} / {maxCapacity}
                    </strong>
                </Box>
                {numOnWaitlist !== '' && <Box>WL: {numOnWaitlist}</Box>}
                {numNewOnlyReserved !== '' && <Box>NOR: {numNewOnlyReserved}</Box>}
            </Box>
        </SectionTableCell>
    );
}
