import React, { Component, Fragment, Suspense } from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Tooltip,
  Snackbar,
  CircularProgress,
} from '@material-ui/core';
import { Add, ArrowDropDown } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import querystring from 'querystring';
import locations from './locations.json';
import stensal from './stensal.png';

const MouseOverPopover = React.lazy(() => import('./MouseOverPopover'));
const Instructors = React.lazy(() => import('./Instructors'));
const POPOVER = React.lazy(() => import('./PopOver'));
const Notification = React.lazy(() => import('../Notification'));
const RstrPopover = React.lazy(() => import('./RstrPopover'));

const AlmanacGraphWrapped = React.lazy(() =>
  import('../AlmanacGraph/AlmanacGraph')
);

const styles = {
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
  code: {
    cursor: 'pointer',
    '&:hover': {
      color: 'blueviolet',
    },
  },
};

class ScheduleAddSelector extends Component {
  constructor(props) {
    super(props);
    this.state = { snacking: false, anchor: null, message: '' };
  }

  handleAddMore = (event) => {
    this.setState({ anchor: event.currentTarget });
  };

  handleAddCurrent = (event) => {
    this.handleClose(this.props.currentScheduleIndex); //add to current
  };

  handleClose = (scheduleNumber) => {
    if (this.disableTBA()) {
      this.setState({
        anchor: null,
        snacking: true,
        message: 'Online/TBA section added! See Added Classes.',
      });
    } else {
      this.setState({ anchor: null });
    }
    if (scheduleNumber !== -1) {
      this.props.onAddClass(
        this.props.section,
        this.props.courseDetails,
        scheduleNumber,
        this.props.termName
      );
    }
  };

  disableTBA = () => {
    let test = false;
    for (const element of this.props.section.meetings[0]) {
      if (element === 'TBA') {
        test = true;
        break;
      }
    }
    return test;
  };

  genMapLink = (location) => {
    try {
      const location_id = locations[location.split(' ')[0]];
      return 'https://map.uci.edu/?id=463#!m/' + location_id;
    } catch (err) {
      return 'https://map.uci.edu/?id=463#!ct/12035,12033,11888,0,12034';
    }
  };

  statusforFindingSpot = (section, classCode) => {
    if (section === 'FULL' || section === 'NewOnly')
      // Enable user to register for Paul Revere notifications
      return (
        <Suspense fallback={<Typography>{section}</Typography>}>
          <Notification
            termName={this.props.termName}
            full={section}
            code={classCode}
            name={this.props.courseDetails.name}
          />
        </Suspense>
      );
    else return section;
  };

  clickToCopy = (event, code) => {
    if (!event) event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();

    let tempEventTarget = document.createElement('input');
    document.body.appendChild(tempEventTarget);
    tempEventTarget.setAttribute('value', code);
    tempEventTarget.select();
    document.execCommand('copy');
    document.body.removeChild(tempEventTarget);
    this.setState({ snacking: true, message: code + ' copied to clipboard.' });
  };

  render() {
    const { classes } = this.props;
    const section = this.props.section;
    return (
      <Fragment>
        <tr className={classes.tr}>
          <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
            <IconButton
              onClick={this.handleAddCurrent}
              style={{ cursor: 'pointer', padding: 0 }}
            >
              <Add fontSize="large" />
            </IconButton>
            <IconButton
              onClick={this.handleAddMore}
              style={{ cursor: 'pointer', padding: 0 }}
            >
              <ArrowDropDown />
            </IconButton>
            <Menu
              anchorEl={this.state.anchor}
              open={Boolean(this.state.anchor)}
              onClose={() => this.handleClose(-1)}
            >
              <MenuItem onClick={() => this.handleClose(0)}>
                Add to schedule 1
              </MenuItem>
              <MenuItem onClick={() => this.handleClose(1)}>
                Add to schedule 2
              </MenuItem>
              <MenuItem onClick={() => this.handleClose(2)}>
                Add to schedule 3
              </MenuItem>
              <MenuItem onClick={() => this.handleClose(3)}>
                Add to schedule 4
              </MenuItem>
              <MenuItem onClick={() => this.handleClose(4)}>
                Add to all
              </MenuItem>
            </Menu>
          </td>
          <Tooltip
            title="Click to copy course code"
            placement="bottom"
            enterDelay={300}
            classes={{ tooltip: classes.lightTooltip }}
          >
            <td
              onClick={(e) => this.clickToCopy(e, section.classCode)}
              className={classes.code}
            >
              {section.classCode}
            </td>
          </Tooltip>
          <td className={classes.multiline + ' ' + classes[section.classType]}>
            {`${section.classType}
Sec: ${section.sectionCode}
Units: ${section.units}`}
          </td>
          <td className={classes.multiline}>
            <Suspense
              fallback={
                <CircularProgress
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white',
                  }}
                />
              }
            >
              <Instructors
                destination={this.props.destination}
                className={classes.multiline}
              >
                {section.instructors}
              </Instructors>
            </Suspense>
          </td>
          <td className={classes.multiline}>
            {section.meetings.map((meeting) => meeting[0]).join('\n')}
          </td>
          <td className={classes.multiline}>
            {section.meetings.map((meeting) => {
              return meeting[1] !== 'ON LINE' && meeting[1] !== 'TBA' ? (
                <Fragment>
                  <a
                    href={this.genMapLink(meeting[1])}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {meeting[1]}
                  </a>
                  <br />
                </Fragment>
              ) : (
                <Fragment>
                  <a
                    href="https://tinyurl.com/2fcpre6"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {meeting[1]}
                  </a>
                  <br />
                </Fragment>
              );
            })}
          </td>
          <td>
            <Suspense
              fallback={
                <Typography>
                  <strong>{`${section.numCurrentlyEnrolled[0]} / ${
                    section.maxCapacity
                  }`}</strong>
                  {`
WL: ${section.numOnWaitlist}
NOR: ${section.numNewOnlyReserved}`}
                </Typography>
              }
            >
              <MouseOverPopover
                className={
                  classes.multiline +
                  ' ' +
                  classes[section.status.toLowerCase()]
                }
              >
                <strong>{`${section.numCurrentlyEnrolled[0]} / ${
                  section.maxCapacity
                }`}</strong>
                {`
WL: ${section.numOnWaitlist}
NOR: ${section.numNewOnlyReserved}`}
              </MouseOverPopover>
            </Suspense>
          </td>
          <td>
            <Suspense
              fallback={<Typography>{section.restrictions}</Typography>}
            >
              <RstrPopover restrictions={section.restrictions} />
            </Suspense>
          </td>
          <td className={classes[section.status.toLowerCase()]}>
            {this.statusforFindingSpot(section.status, section.classCode)}
          </td>
        </tr>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={this.state.snacking}
          autoHideDuration={3000}
          onClose={() => this.setState({ snacking: false })}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={<span id="message-id">{this.state.message}</span>}
        />
      </Fragment>
    );
  }
}

class MiniSectionTable extends Component {
  constructor(props) {
    super(props);
    this.state = { sectionInfo: this.props.courseDetails.sections };
  }

  // shouldComponentUpdate(nextProps, nextState, nextContext) {
  //   return this.props.courseDetails !== nextProps.courseDetails;
  // }
  componentDidMount = async () => {
    //let {building,courseCode,courseNum,coursesFull,dept,endTime,ge,instructor,label,startTime,term,units}=this.props.formData;
    let { dept, ge } = this.props.formData;
    if (ge !== 'ANY' && dept === null) {
      //please put all the form's props condition in to prevent search bugs
      const params = {
        department: this.props.courseDetails.name[0],
        term: this.props.termName,
        courseTitle: this.props.courseDetails.name[2],
        courseNum: this.props.courseDetails.name[1],
      };

      const url =
        'https://fanrn93vye.execute-api.us-west-1.amazonaws.com/latest/api/websoc?' +
        querystring.stringify(params);
      await fetch(url.toString())
        .then((resp) => resp.json())
        .then((json) => {
          const sections = json.reduce((accumulator, school) => {
            school.departments.forEach((dept) => {
              dept.courses.forEach((course) => {
                course.sections.forEach((section) => {
                  accumulator.push(section);
                });
              });
            });

            return accumulator;
          }, []);

          this.setState({ sectionInfo: sections });
        });
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        {this.props.name.includes('I&C SCI 46') ? (
          <a
            href="https://stensal.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginBottom: 8 }}
          >
            <img src={stensal} alt="banner" width="100%" />
          </a>
        ) : (
          <Fragment />
        )}

        <div
          style={{
            display: 'inline-flex',
          }}
        >
          <Suspense
            fallback={
              <CircularProgress
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                }}
              />
            }
          >
            <POPOVER
              name={this.props.name}
              courseDetails={this.props.courseDetails}
            />
          </Suspense>

          <Typography variant="title" style={{ flexGrow: '2' }}>
            &nbsp;
          </Typography>

          <Suspense
            fallback={
              <CircularProgress
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                }}
              />
            }
          >
            <AlmanacGraphWrapped
              term={this.props.term}
              courseDetails={this.props.courseDetails}
            />
          </Suspense>

          <Typography variant="title" style={{ flexGrow: '2' }}>
            &nbsp;
          </Typography>

          {this.props.courseDetails.prerequisiteLink ? (
            <Typography variant="h6" style={{ flexGrow: '2', marginTop: 9 }}>
              <a
                target="blank"
                style={{ textDecoration: 'none', color: '#72a9ed' }}
                href={this.props.courseDetails.prerequisiteLink}
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
          <tr className={classes.tr}>
            <Typography
              dangerouslySetInnerHTML={{
                __html: this.props.courseDetails.comment, //course comments
              }}
              style={{ marginLeft: 8, marginRight: 8 }}
            />
          </tr>
        </table>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Add</th>
              <th>Code</th>
              <th>Type</th>
              <th>Instructors</th>
              <th>Times</th>
              <th>Places</th>
              <th>Enrollment</th>
              <th>Rstr</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this.state.sectionInfo.map((section) => {
              return (
                <ScheduleAddSelector
                  classes={classes}
                  onAddClass={this.props.onAddClass}
                  section={section}
                  courseDetails={this.props.courseDetails}
                  termName={this.props.termName}
                  currentScheduleIndex={this.props.currentScheduleIndex}
                  destination={this.props.destination}
                />
              );
            })}
          </tbody>
        </table>
      </Fragment>
    );
  }
}

export default withStyles(styles)(MiniSectionTable);
