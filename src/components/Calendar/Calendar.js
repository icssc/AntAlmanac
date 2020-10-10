import React, { Component, Fragment } from 'react';
import BigCalendar from 'react-big-calendar';
import { withStyles } from '@material-ui/core/styles';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { Popper } from '@material-ui/core';
import PropTypes from 'prop-types';
import './calendar.css';
import CalendarPaneToolbar from './CalendarPaneToolbar';
import CourseCalendarEvent from './CourseCalendarEvent';
import MobileCalendar from './MobileCalendar';

BigCalendar.momentLocalizer(moment);

const styles = {
  container: {
    margin: '0px 4px 4px 4px',
  },
  firstLineContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    fontWeight: 500,
    fontSize: '0.85rem',
  },
  courseType: {
    fontSize: '0.8rem',
  },
  secondLineContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
  },
  customEventContainer: {
    marginTop: 2,
    marginBottom: 2,
    fontSize: '0.85rem',
  },
  customEventTitle: {
    fontWeight: 500,
  },
};

const CustomEvent = ({ classes }) => (event) => {
  const actualEvent = event.event;

  if (!actualEvent.isCustomEvent)
    return (
      <div>
        <div className={classes.firstLineContainer}>
          <div> {actualEvent.title}</div>
          <div className={classes.courseType}> {actualEvent.courseType}</div>
        </div>
        <div className={classes.secondLineContainer}>
          <div>{actualEvent.location}</div>
          <div>{actualEvent.courseCode}</div>
        </div>
      </div>
    );
  else {
    return (
      <div className={classes.customEventContainer}>
        <div className={classes.customEventTitle}>{event.title}</div>
      </div>
    );
  }
};

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenshotting: false,
      anchorEvent: null,
      moreInfoOpen: false,
      courseInMoreInfo: null,
    };
  }

  handleTakeScreenshot = async (html2CanvasScreenshot) => {
    this.setState({ screenshotting: true }, async () => {
      await html2CanvasScreenshot();
      this.setState({ screenshotting: false });
    });
  };

  handleEventClick = (courseInMoreInfo, event) => {
    const { currentTarget } = event;
    event.stopPropagation();

    if (courseInMoreInfo.courseType !== 'Fin')
      this.setState((state) => ({
        anchorEvent: currentTarget,
        moreInfoOpen:
          state.anchorEvent === currentTarget ? !state.moreInfoOpen : true,
        courseInMoreInfo: courseInMoreInfo,
      }));
  };

  handleClosePopover = () => {
    this.setState({ anchorEvent: null, moreInfoOpen: false });
  };

  handleDragCustomEvent = (slot) => {
    if (slot.action === 'select') {
      //if a selection was dragged out
      this.props.onAddCustomEvent([
        {
          color: '#696969',
          title: 'Waiting for a Name',
          scheduleIndex: this.props.currentScheduleIndex,
          start: slot.start,
          end: slot.end,
          isCustomEvent: true,
          customEventID: Math.floor(Math.random() * 1000000),
        },
      ]);
    } else if (slot.action === 'doubleClick') {
      this.props.onAddCustomEvent([
        {
          color: '#696969',
          title: 'Waiting for a Name',
          scheduleIndex: this.props.currentScheduleIndex,
          start: slot.start,
          end: new Date(slot.start.getTime() + 60 * 60000),
          isCustomEvent: true,
          customEventID: Math.floor(Math.random() * 1000000),
        },
      ]);
    }
  };

  static eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        cursor: 'pointer',
        borderStyle: 'none',
        borderRadius: 4,
      },
    };
  };

  render() {
    const { classes, classEventsInCalendar } = this.props;

    return (
      <div className={classes.container} onClick={this.handleClosePopover}>
        <CalendarPaneToolbar
          onScheduleChange={this.props.onScheduleChange}
          handleClearSchedule={this.props.handleClearSchedule}
          onUndo={this.props.onUndo}
          onAddCustomEvent={this.props.onAddCustomEvent}
          onTakeScreenshot={this.handleTakeScreenshot}
          currentScheduleIndex={this.props.currentScheduleIndex}
          eventsInCalendar={this.props.eventsInCalendar}
          showFinalSchedule={this.props.showFinalSchedule}
          displayFinal={this.props.displayFinal}
        />
        <div>
          <div
            id="screenshot"
            style={
              !this.state.screenshotting
                ? {
                    height: `calc(100vh - 96px - 12px - ${
                      this.props.isDesktop ? '0px' : '48px'
                    })`,
                  }
                : {
                    height: `${this.props.isDesktop ? '100%' : '100vh'}`,
                    display: `${
                      this.props.isDesktop ? 'null' : 'inline-block'
                    }`,
                  }
            }
          >
            <Popper
              anchorEl={this.state.anchorEvent}
              placement="right"
              modifiers={{
                flip: {
                  enabled: true,
                },
                preventOverflow: {
                  enabled: true,
                  boundariesElement: 'scrollParent',
                },
              }}
              open={this.state.moreInfoOpen}
            >
              {this.state.moreInfoOpen ? (
                <CourseCalendarEvent
                  courseInMoreInfo={this.state.courseInMoreInfo}
                  onClassDelete={() =>
                    this.props.onClassDelete(this.state.courseInMoreInfo)
                  }
                  onColorChange={this.props.onColorChange}
                  onEditCustomEvent={this.props.onEditCustomEvent}
                />
              ) : (
                <Fragment />
              )}
            </Popper>
            {this.props.isDesktop ? (
              <BigCalendar
                toolbar={false}
                formats={{
                  timeGutterFormat: (date, culture, localizer) =>
                    date.getMinutes() > 0
                      ? ''
                      : localizer.format(date, 'h A', culture),
                  dayFormat: 'ddd',
                }}
                defaultView={BigCalendar.Views.WORK_WEEK}
                views={[BigCalendar.Views.WORK_WEEK]}
                step={15}
                timeslots={2}
                defaultDate={new Date(2018, 0, 1)}
                min={new Date(2018, 0, 1, 7)}
                max={new Date(2018, 0, 1, 23)}
                events={classEventsInCalendar}
                eventPropGetter={Calendar.eventStyleGetter}
                showMultiDayTimes={false}
                components={{ event: CustomEvent({ classes }) }}
                onSelectEvent={this.handleEventClick}
                selectable={true}
                onSelectSlot={this.handleDragCustomEvent}
              />
            ) : (
              <MobileCalendar
                classEventsInCalendar={classEventsInCalendar}
                EventBox={CustomEvent({ classes })}
                onSelectEvent={this.handleEventClick}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

Calendar.propTypes = {
  currentScheduleIndex: PropTypes.number,
  classEventsInCalendar: PropTypes.arrayOf(
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
  onScheduleChange: PropTypes.func,
  onClearSchedule: PropTypes.func,
  onClassDelete: PropTypes.func,
  onAddCustomEvent: PropTypes.func,
  onColorChange: PropTypes.func,
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

export default withStyles(styles)(Calendar);
