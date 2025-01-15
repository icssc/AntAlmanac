import { WebsocSectionStatus } from '@packages/antalmanac-types';
import { Link } from 'react-router-dom';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { useThemeStore } from '$stores/SettingsStore';

interface WebCellProps {
    webURL: WebsocSectionStatus;
}

export const WebCell = ({ webURL }: WebCellProps) => {
    const isDark = useThemeStore((store) => store.isDark);

    if (!webURL) {
        return <TableBodyCellContainer>{null}</TableBodyCellContainer>;
    }

    return (
        <TableBodyCellContainer>
            <Link to={webURL} target="_blank" referrerPolicy="no-referrer" color={isDark ? 'dodgerblue' : 'blue'}>
                Link
            </Link>
        </TableBodyCellContainer>
    );
};
