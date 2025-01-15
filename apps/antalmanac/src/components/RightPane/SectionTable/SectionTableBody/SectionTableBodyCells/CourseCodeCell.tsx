import { Chip, Tooltip } from '@mui/material';
import { useState } from 'react';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clickToCopy } from '$lib/helpers';
import { useThemeStore } from '$stores/SettingsStore';

interface CourseCodeCellProps {
    sectionCode: string;
}

export const CourseCodeCell = ({ sectionCode }: CourseCodeCellProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <TableBodyCellContainer sx={{ width: '8%' }}>
            <Tooltip title="Click to copy course code" placement="bottom" enterDelay={150}>
                <Chip
                    onClick={(event) => {
                        clickToCopy(event, sectionCode);
                        logAnalytics({
                            category: analyticsEnum.classSearch.title,
                            action: analyticsEnum.classSearch.actions.COPY_COURSE_CODE,
                        });
                    }}
                    // className={classes.sectionCode}
                    label={sectionCode}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        color: isHovered ? (isDark ? 'gold' : 'blueviolet') : '',
                    }}
                    size="small"
                />
            </Tooltip>
        </TableBodyCellContainer>
    );
};

/**
 * {
        display: 'inline-flex',
        cursor: 'pointer',
        '&:hover': {
            cursor: 'pointer',
        },
        alignSelf: 'center',
    },
 */
