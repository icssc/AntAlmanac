import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import type { WebsocSection } from '@packages/anteater-api/types';
import { Link } from 'react-router-dom';

interface SyllabusCellProps {
    webURL: WebsocSection['webURL'];
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
