import { Box } from '@mui/material';
import { WebsocSectionMeeting } from '@packages/antalmanac-types';
import { Fragment } from 'react';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { MapLink } from '$components/buttons/MapLink';
import locationIds from '$lib/locations/locations';

interface LocationsCellProps {
    meetings: WebsocSectionMeeting[];
    courseName: string;
}

export const LocationsCell = ({ meetings }: LocationsCellProps) => {
    return (
        <TableBodyCellContainer>
            {meetings.map((meeting, index) => {
                return !meeting.timeIsTBA ? (
                    meeting.bldg.map((bldg) => {
                        const [buildingName = ''] = bldg.split(' ');
                        const buildingId = locationIds[buildingName];
                        return (
                            <Fragment key={index}>
                                <MapLink buildingId={buildingId} room={bldg} />
                                <br />
                            </Fragment>
                        );
                    })
                ) : (
                    <Box key={index}>{'TBA'}</Box>
                );
            })}
        </TableBodyCellContainer>
    );
};
