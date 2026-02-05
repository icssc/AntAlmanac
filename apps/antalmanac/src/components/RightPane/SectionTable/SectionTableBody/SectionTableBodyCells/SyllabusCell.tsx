import { WebsocSectionStatus } from '@packages/antalmanac-types';
import { Link } from 'react-router-dom';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { useSecondaryColor } from '$hooks/useSecondary';

interface SyllabusCellProps {
    webURL: WebsocSectionStatus;
}

export const SyllabusCell = ({ webURL }: SyllabusCellProps) => {
    const secondaryColor = useSecondaryColor();

    if (!webURL) {
        return <TableBodyCellContainer>{null}</TableBodyCellContainer>;
    }

    return (
        <TableBodyCellContainer>
            <Link to={webURL} target="_blank" referrerPolicy="no-referrer" style={{ color: secondaryColor }}>
                Link
            </Link>
        </TableBodyCellContainer>
    );
};
