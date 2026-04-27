import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { SyllabiPopup } from '$components/RightPane/SectionTable/SyllabiPopup';
import analyticsEnum, { logAnalytics, type AnalyticsCategory } from '$lib/analytics/analytics';
import { History } from '@mui/icons-material';
import { Box, IconButton, Paper, Popover, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

interface SyllabusCellProps {
    webURL?: string | null;
    deptCode: string;
    courseNumber: string;
    term: string;
    instructors: string[];
    analyticsCategory: AnalyticsCategory;
}

export const SyllabusCell = ({
    webURL,
    deptCode,
    courseNumber,
    term,
    instructors,
    analyticsCategory,
}: SyllabusCellProps) => {
    const postHog = usePostHog();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleOpen = useCallback(
        (event: React.MouseEvent<HTMLElement>) => {
            logAnalytics(postHog, {
                category: analyticsCategory,
                action: analyticsEnum.classSearch.actions.CLICK_SYLLABI_CELL,
            });
            setAnchorEl(event.currentTarget);
        },
        [analyticsCategory, postHog]
    );

    const handleClose = useCallback(() => setAnchorEl(null), []);

    return (
        <TableBodyCellContainer>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, paddingLeft: 0.5 }}>
                {webURL ? (
                    <Link to={webURL} target="_blank" referrerPolicy="no-referrer">
                        Link
                    </Link>
                ) : null}
                <Tooltip title="Past syllabi">
                    <IconButton
                        size="small"
                        onClick={handleOpen}
                        aria-label={`View past syllabi for ${deptCode} ${courseNumber}`}
                        sx={{ padding: 0.25 }}
                    >
                        <History fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            </Box>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Paper>
                    <SyllabiPopup
                        deptCode={deptCode}
                        courseNumber={courseNumber}
                        term={term}
                        highlightInstructors={instructors}
                    />
                </Paper>
            </Popover>
        </TableBodyCellContainer>
    );
};
