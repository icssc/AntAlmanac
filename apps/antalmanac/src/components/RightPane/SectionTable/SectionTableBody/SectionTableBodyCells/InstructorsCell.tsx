import { TableBodyCellContainer } from "$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer";
import { Box, SxProps, Typography } from "@mui/material";
import { Link } from "react-router-dom";

interface InstructorsCellProps {
    instructors: string[];
    sx?: SxProps;
}

export const InstructorsCell = ({ instructors, sx }: InstructorsCellProps) => {
    const links = instructors.map((profName, index) => {
        if (profName === "STAFF") {
            return <Box key={profName + index}>{profName}</Box>; // The key should be fine as we're not changing ['STAFF, 'STAFF']
        }

        const lastName = profName.substring(0, profName.indexOf(","));
        return (
            <Box key={profName}>
                <Typography
                    variant="body2"
                    sx={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                    }}
                >
                    <Link
                        to={`https://www.ratemyprofessors.com/search/professors/1074?q=${lastName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {profName}
                    </Link>
                </Typography>
            </Box>
        );
    });

    return <TableBodyCellContainer sx={sx}>{links}</TableBodyCellContainer>;
};
