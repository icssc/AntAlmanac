import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import type { AASection } from '@packages/antalmanac-types';
import { Link } from 'react-router-dom';

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
            <Link to={webURL} target="_blank" referrerPolicy="no-referrer">
                Link
            </Link>
        </TableBodyCellContainer>
    );
};
