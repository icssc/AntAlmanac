import React, { Component, Fragment } from 'react';
import AddCircle from '@material-ui/icons/AddCircle';
import { IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import Notification from '../Notification';
import RstrPopover from './RstrPopover';
import locations from './locations.json';
import { withStyles } from '@material-ui/core/styles';
import Instructors from './Instructors';

const styles = {
  table: {
    borderCollapse: 'collapse',
    boxSizing: 'border-box',
    width: '100%',

    '& thead': {
      position: 'sticky',

      '& th': {
        border: '1px solid rgb(222, 226, 230)',
        fontSize: '0.85rem',
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.54)',
        textAlign: 'left',
        verticalAlign: 'bottom',

        '&:first-child': {
          border: 'none',
        },
      },
    },
  },
  tr: {
    fontSize: '0.85rem',
    '&:nth-child(odd) > td:not(:first-child)': {
      backgroundColor: '#f5f5f5',
    },

    '&:hover': {
      color: 'blueviolet',
    },

    '& td': {
      border: '1px solid rgb(222, 226, 230)',
      textAlign: 'left',
      verticalAlign: 'top',

      '&:first-child': {
        textAlign: 'center',
        verticalAlign: 'middle',
        border: 'none',
      },
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
};

class ScheduleAddSelector extends Component {
  constructor(props) {
    super(props);
    this.state = { anchor: null };
  }

  handleClick = (event) => {
    this.setState({ anchor: event.currentTarget });
  };

  handleClose = (scheduleNumber) => {
    this.setState({ anchor: null }, () => {
      if (scheduleNumber !== -1)
        this.props.onAddClass(
          this.props.section,
          this.props.courseDetails,
          scheduleNumber,

          this.props.termName
        );
    });
  };

  render() {
    return (
      <Fragment>
        <IconButton color="primary" onClick={this.handleClick}>
          <AddCircle />
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
          <MenuItem onClick={() => this.handleClose(4)}>Add to all</MenuItem>
        </Menu>
      </Fragment>
    );
  }
}

class SectionTable extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.props.courseDetails !== nextProps.courseDetails;
  }

  statusforFindingSpot = (section, classCode) => {
    if (section === 'FULL' || section === 'NewOnly')
      // Enable user to register for Paul Revere notifications
      return (
        <Notification
          full={section}
          code={classCode}
          name={this.props.courseDetails.name}
        />
      );
    else return section;
  };

  genMapLink = (location) => {
    try {
      const location_id = locations[location.split(' ')[0]];
      return 'https://map.uci.edu/?id=463#!m/' + location_id;
    } catch (err) {
      return 'https://map.uci.edu/?id=463#!ct/12035,12033,11888,0,12034';
    }
  };

  render() {
    const sectionInfo = this.props.courseDetails.sections;
    const { classes } = this.props;

    return (
      <Fragment>
        <table className={classes.table}>
          <tr className={classes.tr}>
            <Typography
              dangerouslySetInnerHTML={{
                __html: this.props.courseDetails.comment,
              }}
              style={{ marginLeft: 8, marginRight: 8 }}
            />
          </tr>
        </table>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>{}</th>
              <th>Code</th>
              <th>Type</th>
              <th>Instructor</th>
              <th>Time</th>
              <th>Place</th>
              <th>Enrollment</th>
              <th>Rstr.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sectionInfo.map((section) => {
              return (
                <tr className={classes.tr}>
                  <td>
                    <ScheduleAddSelector
                      onAddClass={this.props.onAddClass}
                      section={section}
                      courseDetails={this.props.courseDetails}
                      termName={this.props.termName}
                    />
                  </td>
                  <td>{section.classCode}</td>
                  <td className={classes.multiline}>
                    {`${section.classType}
Sec ${section.sectionCode}
${section.units} units`}
                  </td>
                  <td className={classes.multiline}>
                    <Instructors className={classes.multiline}>
                      {/*this.linkRMP(section.instructors)*/}
                      {section.instructors}
                    </Instructors>
                  </td>
                  <td className={classes.multiline}>
                    {section.meetings.map((meeting) => meeting[0]).join('\n')}
                  </td>
                  <td className={classes.multiline}>
                    {section.meetings.map((meeting) => {
                      return meeting[1] !== 'ON LINE' ? (
                        <div>
                          <a
                            href={this.genMapLink(meeting[1])}
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
                  <td className={classes.multiline + ' ' + section.status}>
                    {`${section.numCurrentlyEnrolled[0]} / ${
                      section.maxCapacity
                    }
WL: ${section.numOnWaitlist}
NOR: ${section.numNewOnlyReserved}`}
                  </td>
                  <td>
                    <RstrPopover restrictions={section.restrictions} />
                  </td>
                  <td className={classes[section.status.toLowerCase()]}>
                    {this.statusforFindingSpot(
                      section.status,
                      section.classCode
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Fragment>
    );
  }
}

export default withStyles(styles)(SectionTable);
