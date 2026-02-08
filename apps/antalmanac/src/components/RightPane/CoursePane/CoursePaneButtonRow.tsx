import { ArrowBack, Visibility, Refresh } from '@mui/icons-material';
import {
    Box,
    Checkbox,
    FormControl,
    IconButton,
    ListItemText,
    MenuItem,
    Select,
    Tooltip,
    type SelectChangeEvent,
    type SxProps,
    Popover,
} from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useMemo, useState } from 'react';

import { NotificationsDialog } from '$components/RightPane/AddedCourses/Notifications/NotificationsDialog';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useColumnStore, SECTION_TABLE_COLUMNS, type SectionTableColumn } from '$stores/ColumnStore';

/**
 * All the interactive buttons have the same styles.
 */
const buttonSx: SxProps = {
    backgroundColor: 'rgba(236, 236, 236, 1)',
    marginRight: 1,
    padding: 1.5,
    boxShadow: '2',
    color: 'black',
    '&:hover': {
        backgroundColor: 'grey',
    },
    pointerEvents: 'auto',
};

const columnLabels: Record<SectionTableColumn, string> = {
    action: 'Action',
    sectionCode: 'Code',
    sectionDetails: 'Type',
    instructors: 'Instructors',
    gpa: 'GPA',
    dayAndTime: 'Times',
    location: 'Places',
    sectionEnrollment: 'Enrollment',
    restrictions: 'Restrictions',
    status: 'Status',
    syllabus: 'Syllabus',
};

/**
 * The {@link Select} input renders an input (text) box which describes the currently selected value(s).
 *
 * This input is triggered with a custom button, not the one that comes with the component.
 *
 * So render an empty string, to make the input text box empty. Although the input ends
 * up being invisible anyways, making it empty ensures that it doesn't take up space.
 */
function renderEmptySelectValue() {
    return '';
}

const COLUMN_LABEL_ENTRIES = Object.entries(columnLabels);

/**
 * Toggles certain columns on/off.
 *
 * e.g. show/hide the section code, instructors, etc.
 */
export function ColumnToggleDropdown() {
    const [selectedColumns, setSelectedColumns] = useColumnStore((store) => [
        store.selectedColumns,
        store.setSelectedColumns,
    ]);
    const [anchorEl, setAnchorEl] = useState<HTMLElement>();
    const open = Boolean(anchorEl);

    const postHog = usePostHog();

    const handleChange = useCallback(
        (e: SelectChangeEvent<SectionTableColumn[]>) => {
            logAnalytics(postHog, {
                category: analyticsEnum.classSearch,
                action: analyticsEnum.classSearch.actions.TOGGLE_COLUMNS,
            });
            if (typeof e.target.value !== 'string') {
                setSelectedColumns(e.target.value);
            }
        },
        [setSelectedColumns, postHog]
    );

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    const selectedColumnNames = useMemo(
        () => SECTION_TABLE_COLUMNS.filter((_, index) => selectedColumns[index]),
        [selectedColumns]
    );

    return (
        <>
            <Tooltip title="Show/Hide Columns">
                <IconButton onClick={handleClick} sx={buttonSx}>
                    <Visibility />
                </IconButton>
            </Tooltip>

            <Popover open={open} anchorEl={anchorEl} onClose={handleClose} sx={{ visibility: 'hidden' }}>
                <FormControl>
                    <Select
                        multiple
                        value={selectedColumnNames}
                        open={open}
                        onChange={handleChange}
                        onClose={handleClose}
                        renderValue={renderEmptySelectValue}
                        MenuProps={{ anchorEl }}
                    >
                        {COLUMN_LABEL_ENTRIES
                            // Disallow toggling the action column (the one to add courses)
                            .filter(([column]) => column !== 'action')
                            // Add 1 to the index to offset the action column being filtered out
                            .map(([column, label], index) => (
                                <MenuItem key={column} value={column}>
                                    <Checkbox checked={selectedColumns[index + 1]} color="default" />
                                    <ListItemText primary={label} />
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Popover>
        </>
    );
}

export interface CoursePaneButtonRowProps {
    /**
     * Whether the search results are currently being shown.
     *
     * @FIXME
     * This is an indescribably stupid way of managing app state.
     * This boolean literally causes components to re-render and fetch data when it's flipped,
     * and it's controlled by a component's local state.
     */
    showSearch: boolean;
    onDismissSearchResults: () => void;
    onRefreshSearch: () => void;
}

/**
 * Buttons to interact with the search results.
 */
export function CoursePaneButtonRow(props: CoursePaneButtonRowProps) {
    return (
        <Box
            sx={{
                display: props.showSearch ? 'block' : 'none',
                width: 'fit-content',
                zIndex: 3,
                position: 'absolute',
            }}
        >
            <Tooltip title="Back">
                <IconButton onClick={props.onDismissSearchResults} sx={buttonSx}>
                    <ArrowBack />
                </IconButton>
            </Tooltip>

            <Tooltip title="Refresh Search Results">
                <IconButton onClick={props.onRefreshSearch} sx={buttonSx}>
                    <Refresh />
                </IconButton>
            </Tooltip>

            <ColumnToggleDropdown />
            <NotificationsDialog buttonSx={buttonSx} />
        </Box>
    );
}
