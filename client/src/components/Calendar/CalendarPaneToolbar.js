import React, { PureComponent} from 'react';
import { withStyles } from '@material-ui/core/styles';
import { IconButton, Tooltip, Typography, InputBase } from '@material-ui/core';
import { ChevronLeft, ChevronRight, Undo } from '@material-ui/icons';
import PropTypes from 'prop-types';
import Submenu from './Submenu';
import DownloadMenu from './DownloadMenu';
import { undoDelete } from '../../actions/AppStoreActions';

import { changeCurrentSchedule } from '../../actions/AppStoreActions';

const styles = {
    toolbar: {
        display: 'flex',
        backgroundColor: '#dfe2e5',
        overflow: 'auto',
        marginBottom: '4px',
        alignItems: 'center',
    },
    inline: {
        display: 'inline',
    },
    spacer: {
        flexGrow: '1',
    },
};

class CalendarPaneToolbar extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            schedule: -1,
        };
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.toolbar}>
                <IconButton onClick={() => changeCurrentSchedule(0)}>
                    <ChevronLeft fontSize="small" />
                </IconButton>

                {/*{this.state.customizedName ? (*/}
                {/*    <InputBase*/}
                {/*        style={{ width: 80 }}*/}
                {/*        onChange={this.onScheduleName}*/}
                {/*        value={this.state.name}*/}
                {/*    />*/}
                {/*) : (*/}
                <Typography variant="body2" className={classes.inline}>
                    {'Schedule ' + (this.props.currentScheduleIndex + 1)}
                </Typography>
                {/*)}*/}
                {/* <Input
        defaultValue={'Schedule ' + (this.props.currentScheduleIndex + 1)}
        className={classes.input}
        inputProps={{
          'aria-label': 'Description',
        }}
      /> */}

                <IconButton onClick={() => changeCurrentSchedule(1)}>
                    <ChevronRight fontSize="small" />
                </IconButton>

                <div className={classes.spacer} />

                <Tooltip title="Undo Last Delete">
                    <IconButton onClick={() => undoDelete(null)}>
                        <Undo fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Download Menu">
                    <DownloadMenu
                        onTakeScreenshot={this.props.onTakeScreenshot}
                        eventsInCalendar={this.props.eventsInCalendar}
                    />
                </Tooltip>

                <Tooltip title="More">
                    <Submenu
                        showFinalsSchedule={this.props.showFinalsSchedule}
                        toggleDisplayFinalsSchedule={
                            this.props.toggleDisplayFinalsSchedule
                        }
                        currentScheduleIndex={this.props.currentScheduleIndex}
                    />
                </Tooltip>
            </div>
        );
    }
}

CalendarPaneToolbar.propTypes = {};

export default withStyles(styles)(CalendarPaneToolbar);
