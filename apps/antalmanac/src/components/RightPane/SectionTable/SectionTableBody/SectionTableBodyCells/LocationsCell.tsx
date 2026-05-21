import { MapLink } from '$components/buttons/MapLink';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import locationIds from '$lib/locations/locations';
import { Box } from '@mui/material';
import { WebsocSectionMeeting } from '@packages/anteater-api/types';
import { Fragment } from 'react';

interface LocationsCellProps {
    meetings: WebsocSectionMeeting[];
    courseName: string;
}

export const LocationsCell = ({ meetings }: LocationsCellProps) => {
    return (
        <TableBodyCellContainer>
            {meetings.flatMap((meeting, meetingIndex) => {
                if (meeting.timeIsTBA) {
                    return <Box key={`${meetingIndex}-tba`}>TBA</Box>;
                }

                return meeting.bldg.map((bldg, bldgIndex) => {
                    const [buildingName = ''] = bldg.split(' ');
                    const buildingId = locationIds[buildingName];
                    return (
                        <Fragment key={`${meetingIndex}-${bldgIndex}-${bldg}`}>
                            <MapLink buildingId={buildingId} room={bldg} />
                            <br />
                        </Fragment>
                    );
                });
            })}
        </TableBodyCellContainer>
    );
};
