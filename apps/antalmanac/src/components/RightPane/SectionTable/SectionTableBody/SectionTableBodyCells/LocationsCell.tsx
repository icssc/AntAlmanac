import { MapLink } from "$components/buttons/MapLink";
import { TableBodyCellContainer } from "$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer";
import locationIds from "$lib/locations/locations";
import { Box } from "@mui/material";
import { WebsocSectionMeeting } from "@packages/antalmanac-types";
import { Fragment } from "react";

interface LocationsCellProps {
    meetings: WebsocSectionMeeting[];
    courseName: string;
}

export const LocationsCell = ({ meetings }: LocationsCellProps) => {
    return (
        <TableBodyCellContainer>
            {meetings.map((meeting) => {
                return !meeting.timeIsTBA ? (
                    meeting.bldg.map((bldg) => {
                        const [buildingName = ""] = bldg.split(" ");
                        const buildingId = locationIds[buildingName];
                        return (
                            <Fragment key={meeting.timeIsTBA + bldg}>
                                <MapLink buildingId={buildingId} room={bldg} />
                                <br />
                            </Fragment>
                        );
                    })
                ) : (
                    <Box>{"TBA"}</Box>
                );
            })}
        </TableBodyCellContainer>
    );
};
