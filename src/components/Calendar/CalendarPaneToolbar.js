import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { IconButton, Tooltip, Typography, InputBase } from '@material-ui/core';
import { ChevronLeft, ChevronRight, Undo } from '@material-ui/icons';
import PropTypes from 'prop-types';
import Submenu from './Submenu';
import DownloadMenu from './DownloadMenu';

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

class CalendarPaneToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      schedule: -1,
      name: 'Schedule 1',
      customizedName: false, //temporary fix for the whole schedule name situation
    };
  }
  onScheduleName = (e) => {
    window.localStorage.setItem(
      'schedule' + this.props.currentScheduleIndex,
      e.target.value
    );
    this.setState({ name: e.target.value });
  };
  render() {
    const { classes } = this.props;

    if (this.state.schedule !== this.props.currentScheduleIndex) {
      let scheduleName = 'Schedule ' + (this.props.currentScheduleIndex + 1);
      if (typeof Storage !== 'undefined') {
        const nameSchedule = window.localStorage.getItem(
          'schedule' + this.props.currentScheduleIndex
        );
        if (nameSchedule !== null) {
          scheduleName = nameSchedule;
          this.setState({ customizedName: true });
        }
      }
      this.setState({
        schedule: this.props.currentScheduleIndex,
        name: scheduleName,
      });
    }

    return (
      <div className={classes.toolbar}>
        <IconButton onClick={() => this.props.onScheduleChange(0)}>
          <ChevronLeft fontSize="small" />
        </IconButton>

        {this.state.customizedName ? (
          <InputBase
            style={{ width: 80 }}
            onChange={this.onScheduleName}
            value={this.state.name}
          />
        ) : (
          <Typography variant="subheading" className={classes.inline}>
            {'Schedule ' + (this.props.currentScheduleIndex + 1)}
          </Typography>
        )}
        {/* <Input
        defaultValue={'Schedule ' + (this.props.currentScheduleIndex + 1)}
        className={classes.input}
        inputProps={{
          'aria-label': 'Description',
        }}
      /> */}

        <IconButton onClick={() => this.props.onScheduleChange(1)}>
          <ChevronRight fontSize="small" />
        </IconButton>

        <div className={classes.spacer} />

        <Tooltip title="Undo Last Delete">
          <IconButton onClick={() => this.props.onUndo(null)}>
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>
        {/**/}

        <Tooltip title="Download Menu">
          <DownloadMenu
            onTakeScreenshot={this.props.onTakeScreenshot}
            eventsInCalendar={this.props.eventsInCalendar}
          />
        </Tooltip>

        <Tooltip title="More">
          <Submenu
            onAddCustomEvent={this.props.onAddCustomEvent}
            handleClearSchedule={this.props.handleClearSchedule}
            onTakeScreenshot={this.props.onTakeScreenshot}
            eventsInCalendar={this.props.eventsInCalendar}
            showFinalSchedule={this.props.showFinalSchedule}
            displayFinal={this.props.displayFinal}
            currentScheduleIndex={this.props.currentScheduleIndex}
          />
        </Tooltip>
      </div>
    );
  }
}

CalendarPaneToolbar.propTypes = {
  onScheduleChange: PropTypes.func,
  onClearSchedule: PropTypes.func,
  onUndo: PropTypes.func,
  onAddCustomEvent: PropTypes.func,
  onTakeScreenshot: PropTypes.func,
  currentScheduleIndex: PropTypes.number,
  classesInCalendar: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string,
      title: PropTypes.string,
      start: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
      end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      courseID: PropTypes.string,
      courseTerm: PropTypes.string,
      location: PropTypes.string,
      type: PropTypes.string,
      isCustomEvent: PropTypes.bool,
      section: PropTypes.object,
      name: PropTypes.string,
    })
  ),
  eventsInCalendar: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string,
      title: PropTypes.string,
      start: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
      end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      courseID: PropTypes.string,
      courseTerm: PropTypes.string,
      location: PropTypes.string,
      type: PropTypes.string,
      isCustomEvent: PropTypes.bool,
      section: PropTypes.object,
      name: PropTypes.arrayOf(PropTypes.string),
    })
  ),
};

export default withStyles(styles)(CalendarPaneToolbar);
