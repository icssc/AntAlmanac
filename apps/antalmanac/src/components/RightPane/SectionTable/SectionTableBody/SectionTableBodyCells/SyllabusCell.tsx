import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { WebsocSectionStatus } from '@packages/antalmanac-types';

interface SyllabusCellProps {
    webURL: WebsocSectionStatus;
}

export const SyllabusCell = ({ webURL }: SyllabusCellProps) => {
    if (!webURL) {
        return <TableBodyCellContainer>{null}</TableBodyCellContainer>;
    }

    return (
        <TableBodyCellContainer>
            <a href={webURL} target="_blank" rel="noopener noreferrer">
                Link
            </a>
        </TableBodyCellContainer>
    );
};
