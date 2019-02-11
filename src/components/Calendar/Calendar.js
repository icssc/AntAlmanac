import React, {Component} from "react";
import BigCalendar from "react-big-calendar";
import {withStyles} from '@material-ui/core/styles';
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import {Paper} from "@material-ui/core";
import PropTypes from 'prop-types';
import "./calendar.css";
import CalendarPaneToolbar from "./CalendarPaneToolbar";
import TabularView from './TabularView';

BigCalendar.momentLocalizer(moment);

const styles = {
    container: {
        margin: '0px 8px 8px 8px',
    },
    courseEventContainer: {
        marginTop: 4, marginBottom: 2, fontWeight: 500
    },
    courseEventType: {
        float: 'left', fontSize: 13
    },
    courseEventCourseID: {
        float: 'right', fontSize: 13
    },
    courseEventLocation: {
        fontSize: 13, clear: 'both'
    },
    customEventContainer: {
        marginTop: 4, marginBottom: 2
    },
    customEventTitle: {
        fontWeight: 500
    },
    screenshotDivNormal: {
        height: "calc(100vh - 96px - 24px)"
    },
    screenshotDivOpen: {}
};

const CustomEvent = ({classes}) => event => {
    let actualEvent = event.event;

    if (!actualEvent.isCustomEvent)
        return (
            <div>
                <div className={classes.courseEventContainer}> {actualEvent.title}</div>
                <div>
                    <div className={classes.courseEventType}>{actualEvent.courseType}</div>
                    <div className={classes.courseEventCourseID}>{actualEvent.courseCode}</div>
                </div>
                <div className={classes.courseEventLocation}>{actualEvent.location}</div>
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
        this.state = {screenshotting: false, showTabularView: false};
    }

    handleTakeScreenshot = async (html2CanvasScreenshot) => {
        this.setState({screenshotting: true}, async () => {
            await html2CanvasScreenshot();
            this.setState({screenshotting: false});
        });
    };

    handleToggleShowTabularView = () => {
        this.setState(previousState => ({showTabularView: !previousState.showTabularView}));
    };

    static eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.color,
                fontSize: 14,
                cursor: "pointer",
                borderRadius: 2
            }
        };
    };

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return (
            this.state.screenshotting !== nextState.screenshotting || this.props.classEventsInCalendar !== nextProps.classEventsInCalendar ||
            this.props.currentScheduleIndex !== nextProps.currentScheduleIndex || this.state.showTabularView !== nextState.showTabularView
        );
    }

    render() {
        const {classes, classEventsInCalendar} = this.props;

        return (
            <div className={classes.container}>
                <CalendarPaneToolbar
                    onScheduleChange={this.props.onScheduleChange}
                    onClearSchedule={this.props.onClearSchedule}
                    onUndo={this.props.onUndo}
                    onToggleShowTabularView={this.handleToggleShowTabularView}
                    onAddCustomEvent={this.props.onAddCustomEvent}
                    onTakeScreenshot={this.handleTakeScreenshot}
                    currentScheduleIndex={this.props.currentScheduleIndex}
                    showTabularView={this.state.showTabularView} 
                />
                <Paper>
                    {this.state.showTabularView ? <TabularView classEventsInCalendar={classEventsInCalendar} colorChange={this.props.colorChange}/> :  <div id="screenshot"
                                                          style={(!this.state.screenshotting ? {height: "calc(100vh - 96px - 24px)"} :
                                                            {height: '100%'})
                                                          }>
                        <BigCalendar
                          toolbar={false}
                          formats={{
                              timeGutterFormat: (date, culture, localizer) =>
                                date.getMinutes() > 0
                                  ? ""
                                  : localizer.format(date, "h A", culture),
                              dayFormat: "ddd"
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
                          components={{event: CustomEvent({classes})}}
                          onSelectEvent={event =>
                            this.props.onClassDelete(event)
                          }
                        />
                    </div>}
                </Paper>
            </div>
        );
    }
}

Calendar.propTypes = {
    currentScheduleIndex: PropTypes.number,
    classEventsInCalendar: PropTypes.shape({
        color: PropTypes.string,
        title: PropTypes.string,
        start: PropTypes.instanceOf(Date),
        end: PropTypes.instanceOf(Date),
        courseID: PropTypes.string,
        courseTerm: PropTypes.string,
        location: PropTypes.string,
        type: PropTypes.string,
        customize: PropTypes.bool,
        section: PropTypes.string,
        name: PropTypes.string
    }),
    onScheduleChange: PropTypes.func,
    onClearSchedule: PropTypes.func,
    onClassDelete: PropTypes.func,
    setID: PropTypes.func,
    onAddCustomEvent: PropTypes.func,
};

export default withStyles(styles)(Calendar);
