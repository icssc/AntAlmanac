import { Box } from '@material-ui/core';

import { OpenSpotAlertPopoverProps } from '$components/RightPane/SectionTable/OpenSpotAlertPopover';
import { SectionTableCell } from '$components/RightPane/SectionTable/cells/section-table-cell';

interface SectionStatusCellProps extends OpenSpotAlertPopoverProps {
    term: string;
}

const SectionStatusColors: Record<string, string> = {
    open: '#00c853',
    waitl: '#1c44b2',
    full: '#e53935',
};

export function SectionStatusCell(props: SectionStatusCellProps) {
    // const { term, sectionCode, courseTitle, courseNumber, status, classes } = props;
    const { status } = props;

    console.log(SectionStatusColors[status.toLowerCase()]);

    // TODO: Implement course notification when Anteater API has the functionality, according to #473
    // if (term === getDefaultTerm().shortName && (status === 'NewOnly' || status === 'FULL')) {
    //     return (
    //         <NoPaddingTableCell className={`${classes[status.toLowerCase()]} ${classes.cell}`}>
    //             <OpenSpotAlertPopover
    //                 courseTitle={courseTitle}
    //                 courseNumber={courseNumber}
    //                 status={status}
    //                 sectionCode={sectionCode}
    //             />
    //         </NoPaddingTableCell>
    //     )
    return (
        <SectionTableCell>
            <Box style={{ color: SectionStatusColors[status.toLowerCase()] }}>{status}</Box>
        </SectionTableCell>
    );
}
