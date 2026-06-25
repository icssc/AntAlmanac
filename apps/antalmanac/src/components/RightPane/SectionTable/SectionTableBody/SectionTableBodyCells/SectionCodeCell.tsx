import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { type AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';
import { clickToCopy } from '$lib/helpers';
import { Chip, Tooltip } from '@mui/material';
import type { AASection } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';

interface SectionCodeCellProps {
    section: AASection;
    analyticsCategory: AnalyticsCategory;
}

export const SectionCodeCell = ({ section, analyticsCategory }: SectionCodeCellProps) => {
    const { sectionCode } = section;

    const postHog = usePostHog();

    return (
        <TableBodyCellContainer sx={{ width: '8%' }}>
            <Tooltip title="Click to copy section code" placement="bottom" enterDelay={150}>
                <Chip
                    onClick={(event) => {
                        clickToCopy(event, sectionCode);
                        logAnalytics(postHog, {
                            category: analyticsCategory,
                            action: analyticsCategory.actions.COPY_COURSE_CODE,
                        });
                    }}
                    label={sectionCode}
                    sx={(theme) => ({
                        '&:hover': {
                            color: 'blueviolet',
                            ...theme.applyStyles('dark', { color: 'gold' }),
                        },
                    })}
                    size="small"
                />
            </Tooltip>
        </TableBodyCellContainer>
    );
};
