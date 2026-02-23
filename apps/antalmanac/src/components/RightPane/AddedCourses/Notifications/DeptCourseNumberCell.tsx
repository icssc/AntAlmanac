import { TableBodyCellContainer } from "$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer";
import { InfoOutlined } from "@mui/icons-material";
import { Box, IconButton, SxProps, Tooltip } from "@mui/material";

interface DeptCourseNumberCellProps {
    deptCode?: string;
    courseNumber?: string;
    courseTitle?: string;
    sx?: SxProps;
}

export const DeptCourseNumberCell = ({
    deptCode,
    courseNumber,
    courseTitle,
    sx,
}: DeptCourseNumberCellProps) => {
    const displayText = deptCode && courseNumber ? `${deptCode} ${courseNumber}` : "";

    return (
        <TableBodyCellContainer sx={sx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box>{displayText}</Box>
                {courseTitle && (
                    <Tooltip
                        title={courseTitle}
                        placement="top"
                        slotProps={{
                            tooltip: {
                                sx: { fontSize: "0.9rem" },
                            },
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{ padding: 0, minWidth: "auto", width: "auto", height: "auto" }}
                        >
                            <InfoOutlined fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </TableBodyCellContainer>
    );
};
