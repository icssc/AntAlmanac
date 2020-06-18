import React, { PureComponent} from 'react';
import { withStyles } from '@material-ui/core/styles';
import { IconButton, Tooltip, Typography, InputBase, Paper, Button } from '@material-ui/core';
import { ChevronLeft, ChevronRight, Undo } from '@material-ui/icons';
import PropTypes from 'prop-types';
import DownloadMenu from './DownloadMenu';
import { undoDelete } from '../../actions/AppStoreActions';
import CustomEventsDialog from '../CustomEvents/CustomEventDialog';
import { changeCurrentSchedule } from '../../actions/AppStoreActions';

const styles = {
  toolbar: {
    display: 'flex',
    overflow: 'auto',
    marginBottom: '4px',
    alignItems: 'center',
    height: '45px',
  },
  inline: {
    display: 'inline',
  },
  spacer: {
    flexGrow: '1',
  },
};

class CalendarPaneToolbar extends PureComponent {
    render() {
        const { classes } = this.props;

        return (
            <Paper elevation={0} variant="outlined" square className={classes.toolbar}>
                <IconButton onClick={() => changeCurrentSchedule(0)}>
                    <ChevronLeft fontSize="small" />
                </IconButton>

                <Typography variant="body2" className={classes.inline}>
                    {'Schedule ' + (this.props.currentScheduleIndex + 1)}
                </Typography>

                <IconButton onClick={() => changeCurrentSchedule(1)}>
                    <ChevronRight fontSize="small" />
                </IconButton>

                <div className={classes.spacer} />

                <Tooltip title="Undo Last Delete">
                    <IconButton onClick={() => undoDelete(null)}>
                        <Undo fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Show Finals Schedule">
                  <Button
                    variant={(this.props.showFinalsSchedule) ? 'contained' : 'outlined'}
                    onClick={this.props.toggleDisplayFinalsSchedule}
                    size='small'
                    color={(this.props.showFinalsSchedule) ? 'primary' : ''}
                  >
                      Finals
                  </Button>
                </Tooltip>

                <Tooltip title="Download Menu">
                    <DownloadMenu
                        onTakeScreenshot={this.props.onTakeScreenshot}
                        eventsInCalendar={this.props.eventsInCalendar}
                    />
                </Tooltip>

                <Tooltip title="Add Custom Events">
                    <CustomEventsDialog editMode={false}/>
                </Tooltip>
            </Paper>
        );
    }
}

CalendarPaneToolbar.propTypes = {
    showFinalsSchedule: PropTypes.bool.isRequired
};

export default withStyles(styles)(CalendarPaneToolbar);
