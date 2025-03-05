import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';

interface InstructorsCellProps {
    instructors: string[];
}

export const InstructorsCell = ({ instructors }: InstructorsCellProps) => {
    const links = instructors.map((profName, index) => {
        if (profName === 'STAFF') {
            return <Box key={profName + index}>{profName}</Box>; // The key should be fine as we're not changing ['STAFF, 'STAFF']
        }

        const lastName = profName.substring(0, profName.indexOf(','));
        return (
            <Box key={profName}>
                <Link
                    to={`https://www.ratemyprofessors.com/search/professors/1074?q=${lastName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {profName}
                </Link>
            </Box>
        );
    });

    return <TableBodyCellContainer>{links}</TableBodyCellContainer>;
};
