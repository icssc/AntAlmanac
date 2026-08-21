import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { Link } from '@mui/material';
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
            <Link href={webURL} target="_blank" rel="noopener noreferrer">
                Link
            </Link>
        </TableBodyCellContainer>
    );
};
