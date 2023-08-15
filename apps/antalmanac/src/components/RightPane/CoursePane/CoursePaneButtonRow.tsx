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
import { ArrowBack, MoreVert, Refresh } from '@mui/icons-material';
import RightPaneStore, { type SectionTableColumn } from '../RightPaneStore';

/**
 * All the interactive buttons have the same styles.
 */
const buttonSx: SxProps = {
    backgroundColor: 'rgba(236, 236, 236, 1)',
    marginRight: 5,
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
    dayAndTime: 'Times',
    location: 'Places',
    sectionEnrollment: 'Enrollment',
    restrictions: 'Restrictions',
    status: 'Status',
};

/**
 * Toggles certain columns on/off.
 *
 * e.g. show/hide the section code, instructors, etc.
 */
export function ColumnToggleButton() {
    const [activeColumns, setActiveColumns] = useState(RightPaneStore.getActiveColumns());
    const [open, setOpen] = useState(false);

    const handleColumnChange = useCallback(
        (newActiveColumns: SectionTableColumn[]) => {
            setActiveColumns(newActiveColumns);
        },
        [setActiveColumns]
    );

    const handleChange = useCallback(
        (e: SelectChangeEvent<SectionTableColumn[]>) => {
            if (typeof e.target.value !== 'string') {
                RightPaneStore.setActiveColumns(e.target.value);
            }
        },
        [RightPaneStore.setActiveColumns]
    );

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    useEffect(() => {
        RightPaneStore.on('columnChange', handleColumnChange);

        return () => {
            RightPaneStore.removeListener('columnChange', handleColumnChange);
        };
    }, [handleColumnChange]);

    return (
        <>
            <Tooltip title="Show/Hide Columns" sx={buttonSx}>
                <IconButton onClick={handleOpen}>
                    <MoreVert />
                </IconButton>
            </Tooltip>
            <FormControl>
                <Select
                    multiple
                    value={activeColumns}
                    open={open}
                    onChange={handleChange}
                    onClose={handleClose}
                    renderValue={() => ''}
                    sx={{ visibility: 'hidden' }}
                >
                    {Object.entries(columnLabels).map(([column, label]) => (
                        <MenuItem key={column} value={column}>
                            <Checkbox
                                checked={activeColumns.indexOf(column as SectionTableColumn) >= 0}
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
