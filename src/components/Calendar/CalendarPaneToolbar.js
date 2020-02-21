import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { IconButton, Tooltip, Typography, InputBase } from '@material-ui/core';
import { ChevronLeft, ChevronRight, Undo } from '@material-ui/icons';
import PropTypes from 'prop-types';
import CustomEventsDialog from '../CustomEvents/Popup';
import DownloadMenu from './DownloadMenu';
import FinalSwitch from './FinalSwitch';
// import ClearSchedButton from './ClearSchedButton';

const styles = {
  toolbar: {
    display: 'flex',
    backgroundColor: '#dfe2e5',
    overflow: 'auto',
    marginBottom: '4px',
    alignItems: 'center',
    height: '48px',
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

    const events = this.props.eventsInCalendar;

    let result = [];
    let finalSchedule = [];
    for (let item of events)
      if (
        !item.isCustomEvent &&
        result.find(function(element) {
          return element.courseCode === item.courseCode;
        }) === undefined
      )
        result.push(item);

    for (let course of result) {
      if (course.section !== undefined) {
        let final = course.section.finalExam;

        if (final.length > 5) {
          let [, , , date, start, startMin, end, endMin, ampm] = final.match(
            /([A-za-z]+) *(\d{1,2}) *([A-za-z]+) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
          );
          start = parseInt(start, 10);
          startMin = parseInt(startMin, 10);
          end = parseInt(end, 10);
          endMin = parseInt(endMin, 10);
          date = [
            date.includes('M'),
            date.includes('Tu'),
            date.includes('W'),
            date.includes('Th'),
            date.includes('F'),
          ];
          if (ampm === 'p' && end !== 12) {
            start += 12;
            end += 12;
            if (start > end) start -= 12;
          }

          date.forEach((shouldBeInCal, index) => {
            if (shouldBeInCal)
              finalSchedule.push({
                title: course.title,
                courseType: 'Fin',
                courseCode: course.courseCode,
                location: course.location,
                color: course.color,
                isCustomEvent: false,
                start: new Date(2018, 0, index + 1, start, startMin),
                end: new Date(2018, 0, index + 1, end, endMin),
              });
          });
        }
      }
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
          <Typography variant="subtitle1" className={classes.inline}>
            {this.props.isDesktop
              ? 'Schedule ' + (this.props.currentScheduleIndex + 1)
              : this.props.currentScheduleIndex + 1}
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

        <FinalSwitch
          displayFinal={this.props.displayFinal}
          schedule={finalSchedule}
          showFinalSchedule={this.props.showFinalSchedule}
          isDesktop={this.props.isDesktop}
        />

        <div className={classes.spacer} />

        <Tooltip title="Undo Last Delete">
          <IconButton onClick={() => this.props.onUndo(null)} fontSize="small">
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>
        {/**/}

        <Tooltip title="Download Menu">
          <DownloadMenu
            onTakeScreenshot={this.props.onTakeScreenshot}
            eventsInCalendar={this.props.eventsInCalendar}
            isDesktop={this.props.isDesktop}
          />
        </Tooltip>

        <CustomEventsDialog
          onAddCustomEvent={this.props.onAddCustomEvent}
          handleSubmenuClose={this.handleClose}
          isDesktop={this.props.isDesktop}
        />

        {/*<ClearSchedButton
          handleSubmenuClose={this.handleClose}
          handleClearSchedule={this.props.handleClearSchedule}
          currentScheduleIndex={this.props.currentScheduleIndex}
        /> */}
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
