import { TableBodyCellContainer } from "$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer";
import { Box, SxProps } from "@mui/material";
import { WebsocSectionType } from "@packages/antalmanac-types";

const SECTION_COLORS = {
    Act: { color: "#c87137" },
    Col: { color: "#ff40b5" },
    Dis: { color: "#ff6e00" },
    Fld: { color: "#1ac805" },
    Lab: { color: "#1abbe9" },
    Lec: { color: "#d40000" },
    Qiz: { color: "#8e5c41" },
    Res: { color: "#ff2466" },
    Sem: { color: "#2155ff" },
    Stu: { color: "#179523" },
    Tap: { color: "#8d2df0" },
    Tut: { color: "#ffc705" },
};

interface DetailCellProps {
    sectionType: WebsocSectionType;
    sectionNum: string | undefined;
    units: number | undefined;
    sx?: SxProps;
}

export const DetailsCell = ({ sectionType, sectionNum, units, sx }: DetailCellProps) => {
    return (
        <TableBodyCellContainer sx={sx}>
            <Box sx={SECTION_COLORS[sectionType]}>{sectionType}</Box>
            <Box>Sec: {sectionNum}</Box>
            <Box>Units:{units}</Box>
        </TableBodyCellContainer>
    );
};
