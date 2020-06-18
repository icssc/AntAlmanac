import React, { PureComponent} from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import { withStyles } from '@material-ui/core/styles';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { Popper } from '@material-ui/core';
import './calendar.css';
import CalendarPaneToolbar from './CalendarPaneToolbar';
import CourseCalendarEvent from './CourseCalendarEvent';
import AppStore from '../../stores/AppStore';

const localizer = momentLocalizer(moment);

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
    sectionType: {
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
                    <div className={classes.sectionType}>
                        {' '}
                        {actualEvent.sectionType}
                    </div>
                </div>
                <div className={classes.secondLineContainer}>
                    <div>{actualEvent.bldg}</div>
                    <div>{actualEvent.sectionCode}</div>
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

class ScheduleCalendar extends PureComponent {
    state = {
        screenshotting: false,
        anchorEvent: null,
        showFinalsSchedule: false,
        moreInfoOpen: false,
        courseInMoreInfo: null,
        eventsInCalendar: AppStore.getEventsInCalendar(),
        finalsEventsInCalendar: AppStore.getFinalEventsInCalendar(),
        currentScheduleIndex: AppStore.getCurrentScheduleIndex(),
    };

    static eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.color,
                cursor: 'pointer',
                borderStyle: 'none',
                borderRadius: 0,
            },
        };
    };

    toggleDisplayFinalsSchedule = () => {
        this.setState((prevState) => {
            return { showFinalsSchedule: !prevState.showFinalsSchedule };
        });
    };

    updateCurrentScheduleIndex = () => {
        this.setState({
            currentScheduleIndex: AppStore.currentScheduleIndex,
        });
    };

    updateEventsInCalendar = () => {
        this.setState({
            eventsInCalendar: AppStore.getEventsInCalendar(),
            finalsEventsInCalendar: AppStore.getFinalEventsInCalendar(),
        });
    };

    componentDidMount = () => {
        AppStore.on('addedCoursesChange', this.updateEventsInCalendar);
        AppStore.on('customEventsChange', this.updateEventsInCalendar);
        AppStore.on(
            'currentScheduleIndexChange',
            this.updateCurrentScheduleIndex
        );
    };

    componentWillUnmount = () => {
        AppStore.removeListener(
            'addedCoursesChange',
            this.updateEventsInCalendar
        );
        AppStore.removeListener(
            'customEventsChange',
            this.updateEventsInCalendar
        );
        AppStore.removeListener(
            'currentScheduleIndexChange',
            this.updateCurrentScheduleIndex
        );
    };

    handleTakeScreenshot = async (html2CanvasScreenshot) => {
        this.setState({ screenshotting: true }, async () => {
            await html2CanvasScreenshot();
            this.setState({ screenshotting: false });
        });
    };

    handleEventClick = (courseInMoreInfo, event) => {
        const { currentTarget } = event;
        event.stopPropagation();

        if (courseInMoreInfo.sectionType !== 'Fin')
            this.setState({
                anchorEvent: currentTarget,
                courseInMoreInfo: courseInMoreInfo,
            });
    };

    handleClosePopover = () => {
        this.setState({ anchorEvent: null });
    };

    getEventsForCalendar = () => {
        const eventSet = this.state.showFinalsSchedule
            ? this.state.finalsEventsInCalendar
            : this.state.eventsInCalendar;

        return eventSet.filter(
            (event) =>
                event.scheduleIndices.includes(
                    this.state.currentScheduleIndex
                ) || event.scheduleIndices.length === 4
        );
    };

    render() {
        const { classes } = this.props;
        return (
            <div
                className={classes.container}
                onClick={this.handleClosePopover}
            >
                <CalendarPaneToolbar
                    onTakeScreenshot={this.handleTakeScreenshot}
                    currentScheduleIndex={this.state.currentScheduleIndex}
                    toggleDisplayFinalsSchedule={
                        this.toggleDisplayFinalsSchedule
                    }
                    showFinalsSchedule={this.state.showFinalsSchedule}
                />
                <div>
                    <div
                        id="screenshot"
                        style={
                            !this.state.screenshotting
                                ? {
                                      height: `calc(100vh - 104px)`,
                                  }
                                : {
                                      height: `${
                                          this.props.isDesktop
                                              ? '100%'
                                              : '100vh'
                                      }`,
                                      display: `${
                                          this.props.isDesktop
                                              ? 'null'
                                              : 'inline-block'
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
                            open={Boolean(this.state.anchorEvent)}
                        >
                            <CourseCalendarEvent
                                courseInMoreInfo={this.state.courseInMoreInfo}
                                currentScheduleIndex={
                                    this.state.currentScheduleIndex
                                }
                            />
                        </Popper>
                        <Calendar
                            localizer={localizer}
                            toolbar={false}
                            formats={{
                                timeGutterFormat: (date, culture, localizer) =>
                                    date.getMinutes() > 0
                                        ? ''
                                        : localizer.format(
                                              date,
                                              'h A',
                                              culture
                                          ),
                                dayFormat: 'ddd',
                            }}
                            defaultView={Views.WORK_WEEK}
                            views={[Views.WORK_WEEK]}
                            step={15}
                            timeslots={2}
                            defaultDate={new Date(2018, 0, 1)}
                            min={new Date(2018, 0, 1, 7)}
                            max={new Date(2018, 0, 1, 23)}
                            events={this.getEventsForCalendar()}
                            eventPropGetter={ScheduleCalendar.eventStyleGetter}
                            showMultiDayTimes={false}
                            components={{ event: CustomEvent({ classes }) }}
                            onSelectEvent={this.handleEventClick}
                        />
                        {/*<Fragment/>*/}
                        {/*// <MobileCalendar*/}
                        {/*//     classEventsInCalendar={classEventsInCalendar}*/}
                        {/*//     EventBox={CustomEvent({ classes })}*/}
                        {/*//     onSelectEvent={this.handleEventClick}*/}
                        {/*// />*/}
                    </div>
                </div>
            </div>
        );
    }
}

ScheduleCalendar.propTypes = {};

export default withStyles(styles)(ScheduleCalendar);
