import React, { Component, Fragment } from 'react';
import ColorPicker from './colorPicker';
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  Snackbar,
  Tooltip,
  Collapse,
  IconButton,
} from '@material-ui/core';
import AlmanacGraphWrapped from '../AlmanacGraph/AlmanacGraph';
import locations from '../CoursePane/locations.json';
import RstrPopover from '../CoursePane/RstrPopover';
import POPOVER from '../CoursePane/PopOver';
import Notification from '../Notification';
import { withStyles } from '@material-ui/core/styles';
import MouseOverPopover from '../CoursePane/MouseOverPopover';
import CustomEventsDialog from '../CustomEvents/Popup';
import Instructors from '../CoursePane/Instructors';
import { Clear, Delete } from '@material-ui/icons';

const styles = {
  colorPicker: {
    '& > div': {
      height: '1.5rem',
      width: '1.5rem',
      borderRadius: '50%',
      margin: 'auto',
      cursor: 'pointer',
    },
  },
  table: {
    borderCollapse: 'collapse',
    boxSizing: 'border-box',
    width: '100%',
    marginTop: '0.285rem',

    '& thead': {
      position: 'sticky',

      '& th': {
        border: '1px solid rgb(222, 226, 230)',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.54)',
        textAlign: 'left',
        verticalAlign: 'bottom',
      },
    },
  },
  tr: {
    fontSize: '0.85rem',
    '&:nth-child(odd)': {
      backgroundColor: '#f5f5f5',
    },

    '& td': {
      border: '1px solid rgb(222, 226, 230)',
      textAlign: 'left',
      verticalAlign: 'top',
    },

    '& $colorPicker': {
      verticalAlign: 'middle',
    },
  },
  code: {
    cursor: 'pointer',
    '&:hover': {
      color: 'blueviolet',
    },
  },
  open: {
    color: '#00c853',
  },
  waitl: {
    color: '#1c44b2',
  },
  full: {
    color: '#e53935',
  },
  multiline: {
    whiteSpace: 'pre',
  },
  Act: { color: '#c87137' },
  Col: { color: '#ff40b5' },
  Dis: { color: '#8d63f0' },
  Fld: { color: '#1ac805' },
  Lab: { color: '#1abbe9' },
  Lec: { color: '#d40000' },
  Qiz: { color: '#8e5c41' },
  Res: { color: '#ff2466' },
  Sem: { color: '#2155ff' },
  Stu: { color: '#179523' },
  Tap: { color: '#8d2df0' },
  Tut: { color: '#ffc705' },
  lightTooltip: {
    backgroundColor: 'rgba(255,255,255)',
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: 0,
    fontSize: 11,
  },
};

class TabularView extends Component {
  constructor(props) {
    super(props);

    let disclaimer = true;
    if (typeof Storage !== 'undefined') {
      disclaimer = window.localStorage.getItem('disclaimer');
      if (disclaimer === null) {
        //nothing stored
        disclaimer = true;
      } else {
        //not first time
        disclaimer = false;
      }
    }

    this.state = {
      copied: false,
      clipboard: '',
      anchorEl: null,
      disclaim: disclaimer,
    };
  }

  getMapLink = (location) => {
    try {
      const locationID = locations[location.split(' ')[0]];
      return 'https://map.uci.edu/?id=463#!m/' + locationID;
    } catch (err) {
      return 'https://map.uci.edu/?id=463#!ct/12035,12033,11888,0,12034';
    }
  };

  statusforFindingSpot = (section, classCode, termName, name) => {
    if (section === 'FULL' || section === 'NewOnly')
      // Enable user to register for Paul Revere notifications
      return (
        <Notification
          termName={termName}
          full={section}
          code={classCode}
          name={name}
        />
      );
    else return section;
  };

  stripCommas = (string) => {
    let result = '';
    for (let i = 0; i < string.length; i++)
      if (string[i] !== ',') result += string[i];
    return result;
  };

  getTimeString = (event) => {
    let startHours = event.start.getHours(),
      startMinutes = event.start.getMinutes();
    let endHours = event.end.getHours(),
      endMinutes = event.end.getMinutes();
    if (startMinutes < 10) {
      startMinutes = `0${startMinutes}`;
    }
    if (endMinutes < 10) {
      endMinutes = `0${endMinutes}`;
    }
    let startTime = `${(startHours % 12).toString()}:${startMinutes}`;
    let endTime = `${(endHours % 12).toString()}:${endMinutes}`;
    if (endHours > 12) {
      endTime += 'p';
    }
    return `${this.stripCommas(event.days.join())} ${startTime}-${endTime}`;
  };

  handleDropdownOpen = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleDropdownClose = () => {
    this.setState({ anchorEl: null });
  };
  clickToCopy = (event, code) => {
    if (!event) event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();

    let Juanito = document.createElement('input');
    document.body.appendChild(Juanito);
    Juanito.setAttribute('value', code);
    Juanito.select();
    document.execCommand('copy');
    document.body.removeChild(Juanito);
    this.setState({ copied: true, clipboard: code });
  };

  handleClearDisclaimer = () => {
    this.setState({ disclaim: false });
    window.localStorage.setItem('disclaimer', 'dismissed');
  };

  render() {
    const { classes } = this.props;
    const events = this.props.eventsInCalendar;
    let result = [];
    let customEvents = [];
    for (let item of events)
      if (
        !item.isCustomEvent &&
        result.find(function(element) {
          return element.courseCode === item.courseCode;
        }) === undefined
      )
        result.push(item);
      else if (item.isCustomEvent) {
        let day = item.start.toDateString().substring(0, 1);
        if (day === 'T') {
          day = item.start.toDateString().substring(0, 2);
        }

        let ce = customEvents.find(
          (event) => event.customEventID === item.customEventID
        );
        if (ce === undefined) {
          item.days = [day];
          customEvents.push(item);
        } else if (ce.days.find((d) => d === day) === undefined) {
          ce.days.push(day);
        }
      }

    const courses = [];
    let totalUnits = 0;

    for (let course of result) {
      let foundIndex = courses.findIndex(function(element) {
        return (
          course.name.join() === element.name.join() &&
          element.courseTerm === course.courseTerm
        );
      });

      if (foundIndex === -1) {
        courses.push({
          name: course.name,
          lecAndDis: [course],
          prerequisiteLink: course.prerequisiteLink,
          final: course.section.finalExam,
          //  courseID:event.courseID,
          courseTerm: course.courseTerm,
        });
      } else {
        courses[foundIndex].lecAndDis.push(course);
      }

      if (!isNaN(Number(course.section.units)))
        totalUnits += Number(course.section.units);
    }

    return (
      <Fragment>
        <div
          className={classes.container}
          style={{ display: 'inline-flex', width: '100%', marginBottom: 10 }}
        >
          <Typography variant="title" style={{ flexGrow: 1 }}>
            Schedule {this.props.scheduleIndex + 1} ({totalUnits} Units)
          </Typography>

          <Button
            aria-owns={this.state.anchor ? 'simple-menu' : undefined}
            aria-haspopup="true"
            onClick={this.handleDropdownOpen}
          >
            Copy Schedule
          </Button>

          <Menu
            id="copyScheduleDropdown"
            anchorEl={this.state.anchorEl}
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleDropdownClose}
          >
            {[0, 1, 2, 3].map((index) => {
              return (
                <MenuItem
                  disabled={this.props.scheduleIndex === index}
                  onClick={() => {
                    this.props.onCopySchedule(index);
                    this.handleDropdownClose();
                  }}
                >
                  Copy to Schedule {index + 1}
                </MenuItem>
              );
            })}

            <MenuItem
              onClick={() => {
                this.props.onCopySchedule(4);
                this.handleDropdownClose();
              }}
            >
              Copy to All Schedules
            </MenuItem>
          </Menu>

          <Button
            style={{ color: 'red' }}
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to clear this schedule? You cannot undo this action, but you can load your schedule again.'
                )
              )
                this.props.handleClearSchedule([this.props.scheduleIndex]);
            }}
          >
            Clear Schedule
          </Button>
        </div>

        <div>
          {' '}
          {/*go to webreg disclaimer*/}
          <Collapse in={this.state.disclaim}>
            <table style={{ margin: 20 }}>
              <tbody>
                <tr>
                  <td>
                    <IconButton onClick={this.handleClearDisclaimer}>
                      <Clear />
                    </IconButton>
                  </td>
                  <td>
                    <Typography variant="h6">
                      Adding courses on the AntAlmanac is NOT official
                      enrollment!
                      <br />
                      Make sure to sign up on{' '}
                      <a
                        href="https://www.reg.uci.edu/registrar/soc/webreg.html"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WebReg
                      </a>
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>
          </Collapse>
        </div>

        {courses.length === 0 ? (
          <div style={{ marginTop: 20 }}>
            <Typography variant="h5">There's nothing here yet ...</Typography>
            <Typography variant="h6">
              ... because you haven't added anything to your calendar yet!
              <br />
              <br />
              Go to search view to find classes to put into your calendars.
              <br />
              Then come back here to see more details on selected class and
              change their colors!
            </Typography>
          </div>
        ) : (
          <Fragment />
        )}

        {courses.map((event) => {
          return (
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  marginTop: 10,
                }}
              >
                <POPOVER
                  name={
                    event.name[0] + ' ' + event.name[1] + ' | ' + event.name[2]
                  }
                  courseDetails={event}
                />

                <Typography variant="title" style={{ flexGrow: '2' }}>
                  &nbsp;
                </Typography>

                <AlmanacGraphWrapped
                  term={event.courseTerm}
                  courseDetails={event}
                />

                <Typography variant="title" style={{ flexGrow: '2' }}>
                  &nbsp;
                </Typography>

                {event.prerequisiteLink ? (
                  <Typography
                    variant="h6"
                    style={{ flexGrow: '2', marginTop: 9 }}
                  >
                    <a
                      target="blank"
                      style={{ textDecoration: 'none', color: '#72a9ed' }}
                      href={event.prerequisiteLink}
                      rel="noopener noreferrer"
                    >
                      Prerequisites
                    </a>
                  </Typography>
                ) : (
                  <Fragment />
                )}
              </div>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>Color</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Instructor</th>
                    <th>Time</th>
                    <th>Place</th>
                    <th>Enrollmt</th>
                    <th>Rstr</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {event.lecAndDis.map((item) => {
                    const secEach = item.section;

                    return (
                      <tr className={classes.tr}>
                        <Tooltip
                          title="Click to change color"
                          placement="right"
                          classes={{ tooltip: classes.lightTooltip }}
                        >
                          <td className={classes.colorPicker}>
                            <ColorPicker
                              onColorChange={this.props.onColorChange}
                              event={item}
                            />
                          </td>
                        </Tooltip>
                        <Tooltip
                          title="Click to copy course code"
                          placement="right"
                          classes={{ tooltip: classes.lightTooltip }}
                        >
                          <td
                            onClick={(e) =>
                              this.clickToCopy(e, secEach.classCode)
                            }
                            className={classes.code}
                          >
                            {secEach.classCode}
                          </td>
                        </Tooltip>
                        <td
                          className={
                            classes.multiline + ' ' + classes[secEach.classType]
                          }
                        >
                          {`${secEach.classType}
Sec ${secEach.sectionCode}
${secEach.units} units`}
                        </td>
                        <td className={classes.multiline}>
                          <Instructors
                            destination={this.props.destination}
                            className={classes.multiline}
                          >
                            {secEach.instructors}
                          </Instructors>
                        </td>
                        <td className={classes.multiline}>
                          {secEach.meetings
                            .map((meeting) => meeting[0])
                            .join('\n')}
                        </td>
                        <td className={classes.multiline}>
                          {secEach.meetings.map((meeting) => {
                            return meeting[1] !== 'ON LINE' &&
                              meeting[1] !== 'TBA' ? (
                              <div>
                                <a
                                  href={this.getMapLink(meeting[1])}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {meeting[1]}
                                </a>
                                <br />
                              </div>
                            ) : (
                              meeting[1]
                            );
                          })}
                        </td>
                        <td>
                          <MouseOverPopover
                            className={
                              classes.multiline +
                              ' ' +
                              classes[secEach.status.toLowerCase()]
                            }
                          >
                            {`${secEach.numCurrentlyEnrolled[0]} / ${
                              secEach.maxCapacity
                            }
WL: ${secEach.numOnWaitlist}
NOR: ${secEach.numNewOnlyReserved}`}
                          </MouseOverPopover>
                        </td>
                        <td>
                          <RstrPopover restrictions={secEach.restrictions} />
                        </td>
                        <td className={classes[secEach.status.toLowerCase()]}>
                          {this.statusforFindingSpot(
                            secEach.status,
                            secEach.classCode,
                            item.courseTerm,
                            item.name
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        {customEvents.length === 0 ? null : (
          <div>
            <div style={{ display: 'flex', marginTop: 40 }}>
              <Typography variant="h6">Custom Events</Typography>
            </div>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>Color</th>
                  <th>Edit</th>
                  <th>Delete</th>
                  <th>Title</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {customEvents.map((event) => {
                  return (
                    <tr className={classes.tr}>
                      <td
                        className={classes.colorPicker}
                        width="50"
                        height="40"
                      >
                        <ColorPicker
                          onColorChange={this.props.onColorChange}
                          event={event}
                        />
                      </td>
                      <td width="40">
                        <CustomEventsDialog
                          editMode={true}
                          event={event}
                          onEditCustomEvent={this.props.onEditCustomEvent}
                        />
                      </td>
                      <td width="40">
                        <IconButton
                          onClick={() => {
                            this.props.onClassDelete(event);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </td>
                      <td>{event.title}</td>
                      <td>{this.getTimeString(event)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={this.state.copied}
          autoHideDuration={1500}
          onClose={() => this.setState({ copied: false })}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={
            <span id="message-id">
              {this.state.clipboard} copied to clipboard.
            </span>
          }
          style={{ color: 'green' }}
        />
      </Fragment>
    );
  }
}

export default withStyles(styles)(TabularView);
