import { TableBodyCellContainer } from "$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer";
import { WebsocSectionStatus } from "@packages/antalmanac-types";
import { Link } from "react-router-dom";

interface SyllabusCellProps {
    webURL: WebsocSectionStatus;
}

export const SyllabusCell = ({ webURL }: SyllabusCellProps) => {
    if (!webURL) {
        return <TableBodyCellContainer>{null}</TableBodyCellContainer>;
    }

    return (
        <TableBodyCellContainer>
            <Link to={webURL} target="_blank" referrerPolicy="no-referrer">
                Link
            </Link>
        </TableBodyCellContainer>
    );
};
