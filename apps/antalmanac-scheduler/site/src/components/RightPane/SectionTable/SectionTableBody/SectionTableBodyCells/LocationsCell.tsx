import { MapLink } from '$components/buttons/MapLink';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import locationIds from '$lib/locations/locations';
import { Box } from '@mui/material';
import type { AASection } from '@packages/antalmanac-types';
import { Fragment } from 'react';

interface LocationsCellProps {
    section: AASection;
}

export const LocationsCell = ({ section }: LocationsCellProps) => {
    const { meetings } = section;
    return (
        <TableBodyCellContainer>
            {meetings.map((meeting, meetingIndex) => {
                const meetingKey = meeting.timeIsTBA
                    ? `tba-${meetingIndex}`
                    : `${meeting.days}-${meeting.bldg.join('-')}-${meeting.startTime.hour}-${meeting.startTime.minute}-${meeting.endTime.hour}-${meeting.endTime.minute}`;

                return (
                    <Fragment key={meetingKey}>
                        {!meeting.timeIsTBA ? (
                            meeting.bldg.map((bldg) => {
                                const [buildingName = ''] = bldg.split(' ');
                                const buildingId = locationIds[buildingName];
                                return (
                                    <Fragment key={bldg}>
                                        <MapLink buildingId={buildingId} room={bldg} />
                                        <br />
                                    </Fragment>
                                );
                            })
                        ) : (
                            <Box>{'TBA'}</Box>
                        )}
                    </Fragment>
                );
            })}
        </TableBodyCellContainer>
    );
};
