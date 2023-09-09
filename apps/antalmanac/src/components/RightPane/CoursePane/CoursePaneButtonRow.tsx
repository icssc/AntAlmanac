import { useCallback, useEffect, useState } from 'react';
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
} from '@mui/material';
import { ArrowBack, Visibility, Refresh } from '@mui/icons-material';
import RightPaneStore from '../RightPaneStore';
import useColumnStore, { type SectionTableColumn } from '$stores/ColumnStore';

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
    sectionCode: 'Code',
    sectionDetails: 'Type',
    instructors: 'Instructors',
    gpa: 'GPA',
    dayAndTime: 'Times',
    location: 'Places',
    sectionEnrollment: 'Enrollment',
    restrictions: 'Restrictions',
    status: 'Status',
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

/**
 * Toggles certain columns on/off.
 *
 * e.g. show/hide the section code, instructors, etc.
 */
export function ColumnToggleButton() {
    const { activeColumns, setActiveColumns } = useColumnStore();
    const [open, setOpen] = useState(false);

    const handleChange = (e: SelectChangeEvent<SectionTableColumn[]>) => {
        if (typeof e.target.value !== 'string') {
            setActiveColumns(e.target.value);
        }
    };

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return (
        <>
            <Tooltip title="Show/Hide Columns" sx={buttonSx}>
                <IconButton onClick={handleOpen}>
                    <Visibility />
                </IconButton>
            </Tooltip>
            <FormControl>
                <Select
                    multiple
                    value={activeColumns}
                    open={open}
                    onChange={handleChange}
                    onClose={handleClose}
                    renderValue={renderEmptySelectValue}
                    sx={{ visibility: 'hidden' }}
                >
                    {Object.entries(columnLabels).map(([column, label]) => (
                        <MenuItem key={column} value={column}>
                            <Checkbox
                                checked={activeColumns.indexOf(column as SectionTableColumn) > -1}
                                color="default"
                            />
                            <ListItemText primary={label} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
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
                width: '100%',
                zIndex: 3,
                marginBottom: 8,
                position: 'absolute',
            }}
        >
            <Tooltip title="Back" sx={buttonSx}>
                <IconButton onClick={props.onDismissSearchResults}>
                    <ArrowBack />
                </IconButton>
            </Tooltip>

            <Tooltip title="Refresh Search Results" sx={buttonSx}>
                <IconButton onClick={props.onRefreshSearch}>
                    <Refresh />
                </IconButton>
            </Tooltip>

            <ColumnToggleButton />
        </Box>
    );
}

export default CoursePaneButtonRow;
