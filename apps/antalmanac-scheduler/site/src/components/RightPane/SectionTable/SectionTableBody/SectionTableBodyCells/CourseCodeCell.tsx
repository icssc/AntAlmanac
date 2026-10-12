import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { type AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';
import { clickToCopy } from '$lib/helpers';
import { Chip, type SxProps, type TableCellProps, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';

interface CourseCodeCellProps extends TableCellProps {
    sectionCode: string;
    analyticsCategory: AnalyticsCategory;
    sx?: SxProps;
}

export const CourseCodeCell = ({ sectionCode, analyticsCategory, sx, ...rest }: CourseCodeCellProps) => {
    const postHog = usePostHog();

    return (
        <TableBodyCellContainer sx={{ width: '8%', ...sx }} {...rest}>
            <Tooltip title="Click to copy course code" placement="bottom" enterDelay={150}>
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
