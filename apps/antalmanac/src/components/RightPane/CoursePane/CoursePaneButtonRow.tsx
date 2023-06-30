import { IconButton, Select, Theme, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { ArrowBack, MoreVert, Refresh } from '@material-ui/icons';
import { Checkbox, FormControl, ListItemText, MenuItem } from '@material-ui/core';
import { ChangeEvent, PureComponent } from 'react';
import RightPaneStore from '../RightPaneStore';
import { isDarkMode } from '$lib/helpers';

const styles: Styles<Theme, object> = {
    buttonRow: {
        width: '100%',
        zIndex: 3,
        marginBottom: 8,
        position: 'absolute',
        pointerEvents: 'none',
    },
    button: {
        backgroundColor: 'rgba(236, 236, 236, 1)',
        marginRight: 5,
        boxShadow: '2',
        color: 'black',
        '&:hover': {
            backgroundColor: 'grey',
        },
        pointerEvents: 'auto',
    },
};

const columnList: { value: string; label: string }[] = [
    { value: 'sectionCode', label: 'Code' },
    { value: 'sectionDetails', label: 'Type' },
    { value: 'instructors', label: 'Instructors' },
    { value: 'dayAndTime', label: 'Times' },
    { value: 'location', label: 'Places' },
    { value: 'sectionEnrollment', label: 'Enrollment' },
    { value: 'restrictions', label: 'Restrictions' },
    { value: 'status', label: 'Status' },
];

interface ColumnFilterProps {
    activeColumns: string[];
    displayColumnSelector: boolean;
    handleClick: () => void;
    handleChange: (event: ChangeEvent<{ restrictions?: string | undefined; value: unknown }>) => void;
}

class ColumnFilter extends PureComponent<ColumnFilterProps> {
    render() {
        const { activeColumns, displayColumnSelector, handleClick, handleChange } = this.props;

        return (
            <FormControl>
                <Select
                    style={{ width: '0', zIndex: -1, color: isDarkMode() ? '#303030' : '#FAFAFA' }}
                    inputProps={{ IconComponent: () => null }}
                    open={displayColumnSelector}
                    multiple
                    onClose={handleClick}
                    value={activeColumns}
                    onChange={handleChange}
                >
                    {columnList.map((column) => (
                        <MenuItem key={column.value} value={column.value} style={{ maxWidth: '200px' }}>
                            <Checkbox checked={activeColumns.indexOf(column.value) >= 0} color="default" />
                            <ListItemText primary={column.label} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }
}

interface CoursePaneButtonRowProps {
    classes: ClassNameMap;
    showSearch: boolean;
    displayColumnSelector: boolean;
    onDismissSearchResults: () => void;
    onRefreshSearch: () => void;
}

class CoursePaneButtonRow extends PureComponent<CoursePaneButtonRowProps> {
    state = {
        displayColumnSelector: false,
        // value (sectionCode), label (Code), component (CourseCodeCell)
        activeColumns: [
            'sectionCode',
            'sectionDetails',
            'instructors',
            'dayAndTime',
            'location',
            'sectionEnrollment',
            'restrictions',
            'status',
        ],
    };

    handleClick = () => {
        this.setState((prevState: CoursePaneButtonRowProps) => ({
            displayColumnSelector: !prevState.displayColumnSelector,
        }));
    };

    handleChange = (event: ChangeEvent<{ restrictions?: string | undefined; value: unknown }>) => {
        this.setState({ activeColumns: event.target.value }, () => {
            RightPaneStore.setActiveColumns(this.state.activeColumns);
        });
    };

    render() {
        const { classes } = this.props;
        const { displayColumnSelector, activeColumns } = this.state;

        return (
            <div className={classes.buttonRow} style={{ display: this.props.showSearch ? 'block' : 'none' }}>
                <Tooltip title="Back">
                    <IconButton onClick={this.props.onDismissSearchResults} className={classes.button}>
                        <ArrowBack />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Refresh Search Results">
                    <IconButton onClick={this.props.onRefreshSearch} className={classes.button}>
                        <Refresh />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Hide Columns">
                    <IconButton onClick={this.handleClick} className={classes.button}>
                        <MoreVert />
                    </IconButton>
                </Tooltip>

                <ColumnFilter
                    activeColumns={activeColumns}
                    displayColumnSelector={displayColumnSelector}
                    handleClick={this.handleClick}
                    handleChange={this.handleChange}
                />
            </div>
        );
    }
}

export default withStyles(styles)(CoursePaneButtonRow);
