import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import type { AASection } from '@packages/antalmanac-types';

interface SyllabusCellProps {
    section: AASection;
}

export const SyllabusCell = ({ section }: SyllabusCellProps) => {
    const { webURL } = section;
    if (!webURL) {
        return <TableBodyCellContainer>{null}</TableBodyCellContainer>;
    }

    return (
        <TableBodyCellContainer>
            <a href={webURL} target="_blank" rel="noreferrer">
                Link
            </a>
        </TableBodyCellContainer>
    );
};
