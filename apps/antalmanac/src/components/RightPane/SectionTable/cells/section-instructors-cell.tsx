import { Box } from '@material-ui/core';

import { SectionTableCell } from '$components/RightPane/SectionTable/cells/section-table-cell';

interface SectionInstructorsCellProps {
    instructors: string[];
}

export function SectionInstructorsCell(props: SectionInstructorsCellProps) {
    const { instructors } = props;

    const getLinks = (professorNames: string[]) => {
        return professorNames.map((profName, index) => {
            if (profName !== 'STAFF') {
                const lastName = profName.substring(0, profName.indexOf(','));
                return (
                    <Box key={profName}>
                        <a
                            href={`https://www.ratemyprofessors.com/search/professors/1074?q=${lastName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {profName}
                        </a>
                    </Box>
                );
            } else {
                return <Box key={profName + index}> {profName} </Box>; // The key should be fine as we're not changing ['STAFF, 'STAFF']
            }
        });
    };

    return <SectionTableCell>{getLinks(instructors)}</SectionTableCell>;
}
