import { Chip, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useState } from 'react';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';
import { clickToCopy } from '$lib/helpers';
import { useThemeStore } from '$stores/SettingsStore';

interface SectionCodeCellProps {
    sectionCode: string;
    analyticsCategory: AnalyticsCategory;
}

export const SectionCodeCell = ({ sectionCode, analyticsCategory }: SectionCodeCellProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    const [isHovered, setIsHovered] = useState(false);

    const postHog = usePostHog();

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <TableBodyCellContainer sx={{ width: '8%' }}>
            <Tooltip title="Click to copy section code" placement="bottom" enterDelay={150}>
                <Chip
                    onClick={(event) => {
                        clickToCopy(event, sectionCode);
                        logAnalytics(postHog, {
                            category: analyticsCategory,
                            action: analyticsCategory.actions.COPY_SECTION_CODE,
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
