import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { IconButton, Tooltip, Paper, Button } from '@material-ui/core';
import { Delete, Undo } from '@material-ui/icons';
import PropTypes from 'prop-types';
import { clearSchedules, undoDelete } from '../../actions/AppStoreActions';
import CustomEventsDialog from '../CustomEvents/CustomEventDialog';
import { changeCurrentSchedule } from '../../actions/AppStoreActions';
import ScreenshotButton from './ScreenshotButton';
import ExportCalendar from './ExportCalendar';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ReactGA from 'react-ga';

const styles = {
    toolbar: {
        display: 'flex',
        overflow: 'auto',
        marginBottom: '4px',
        alignItems: 'center',
        height: '50px',

        '& button': {
            marginRight: '4px',
        },
        padding: '4px',
    },
    inline: {
        display: 'inline',
    },
    spacer: {
        flexGrow: '1',
    },
};

class CalendarPaneToolbar extends PureComponent {
    handleScheduleChange(event) {
        changeCurrentSchedule(event.target.value);
    }

    render() {
        const { classes } = this.props;

        return (
            <Paper elevation={0} variant="outlined" square className={classes.toolbar}>
                <Select value={this.props.currentScheduleIndex} onChange={this.handleScheduleChange}>
                    <MenuItem value={0}>Schedule 1</MenuItem>
                    <MenuItem value={1}>Schedule 2</MenuItem>
                    <MenuItem value={2}>Schedule 3</MenuItem>
                    <MenuItem value={3}>Schedule 4</MenuItem>
                </Select>

                <div className={classes.spacer} />

                <Tooltip title="Undo last deleted course">
                    <IconButton onClick={() => undoDelete(null)}>
                        <Undo fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Clear schedule">
                    <IconButton
                        onClick={() => {
                            if (
                                window.confirm(
                                    'Are you sure you want to clear this schedule? You cannot undo this action, but you can load your schedule again.'
                                )
                            ) {
                                clearSchedules([this.props.currentScheduleIndex]);
                                ReactGA.event({
                                    category: 'antalmanac-rewrite',
                                    action: 'Click Clear button',
                                    label: 'Calendar Pane Toolbar',
                                });
                            }
                        }}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Toggle showing finals schedule">
                    <Button
                        variant={this.props.showFinalsSchedule ? 'contained' : 'outlined'}
                        onClick={this.props.toggleDisplayFinalsSchedule}
                        size="small"
                        color={this.props.showFinalsSchedule ? 'primary' : 'default'}
                    >
                        Finals
                    </Button>
                </Tooltip>

                <ExportCalendar />

                <ScreenshotButton onTakeScreenshot={this.props.onTakeScreenshot} />

                <CustomEventsDialog editMode={false} />
            </Paper>
        );
    }
}

CalendarPaneToolbar.propTypes = {
    showFinalsSchedule: PropTypes.bool.isRequired,
    currentScheduleIndex: PropTypes.number.isRequired,
};

export default withStyles(styles)(CalendarPaneToolbar);
