import React, {Component, Fragment} from "react";
import {Menu, MenuItem, Typography} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import rmpData from "./RMP.json";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";
import POPOVER from "./PopOver";
import Notification from '../Notification';
import RstrPopover from "./RstrPopover";
import locations from "./locations.json";
import querystring from "querystring";

const styles = {
  table: {
    borderCollapse: "collapse",
    boxSizing: "border-box",
    width: "100%",
    marginTop: '0.285rem',

    "& thead": {
      position: "sticky",

      "& th": {
        border: "1px solid rgb(222, 226, 230)",
        fontSize: "0.85rem",
        fontWeight: "500",
        color: "rgba(0, 0, 0, 0.54)",
        textAlign: "left",
        verticalAlign: "bottom"
      }
    }
  },
  tr: {
    fontSize: "0.85rem",
    '&:nth-child(odd)': {
      backgroundColor: '#f5f5f5'
    },

    "&:hover": {
      color: "blueviolet"
    },

    "& td": {
      border: "1px solid rgb(222, 226, 230)",
      textAlign: "left",
      verticalAlign: "top"
    }
  },
  open: {
    color: '#00c853'
  },
  waitl: {
    color: '#1c44b2'
  },
  full: {
    color: '#e53935'
  },
  multiline: {
    whiteSpace: 'pre'
  }
};

class ScheduleAddSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {anchor: null};
  }

  handleClick = event => {
    this.setState({anchor: event.currentTarget});
  };

  handleClose = scheduleNumber => {
    this.setState({anchor: null});
    if (scheduleNumber !== -1) {
      this.props.onAddClass(
        this.props.section,
        this.props.courseDetails,
        scheduleNumber,

        this.props.termName
      );
    }
  };

  redirectRMP = (e, name) => {
    if (!e) e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();

    var lastName = name.substring(0, name.indexOf(","));
    var nameP = rmpData[0][name];
    if (nameP !== undefined)
      window.open("https://www.ratemyprofessors.com" + nameP);
    else
      window.open(
        `https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university+of+california+irvine&queryoption=HEADER&query=${lastName}&facetSearch=true`
      );
  };

  linkRMP = name => {
    const rmpStyle = {
      textDecoration: "underline",
      color: "#0645AD",
      cursor: "pointer"
    };
    return name.map(item => {
      if (item !== "STAFF") {
        return (
          <div
            style={rmpStyle}
            onClick={e => {
              this.redirectRMP(e, item);
            }}
          >
            {item}
          </div>
        );
      } else return item;
    });
  };

  disableTBA = section => {
    var test = false;
    for (var element of section.meetings[0]) {
      if (element === "TBA") {
        test = true;
        break;
      }
    }
    return test;
  };

  genMapLink = location => {
    try {
      const location_id = locations[location.split(" ")[0]];
      return "https://map.uci.edu/?id=463#!m/" + location_id;
    } catch (err) {
      return "https://map.uci.edu/?id=463#!ct/12035,12033,11888,0,12034";
    }
  };

  statusforFindingSpot = (section, classCode) => {
    if (section === 'FULL')
      return <Notification termName={this.props.termName} full={section} code={classCode}
                           name={this.props.courseDetails.name}/>;
    else
      return section;
  };

  render() {
    const {classes} = this.props;
    const section = this.props.section;
    return (
      <Fragment>
        <tr
          className={classes.tr}
          {...(!this.disableTBA(section)
            ? {onClick: this.handleClick, style: {cursor: "pointer"}}
            : {})}
        >
          <td>{section.classCode}</td>
          <td className={classes.multiline}>
            {`${section.classType}
Sec: ${section.sectionCode}
Units: ${section.units}`}
          </td>
          <td className={classes.multiline}>
            {/* {this.linkRMP(section.instructors)} */}
            {section.instructors.join("\n")}
          </td>
          <td className={classes.multiline}>
            {section.meetings.map(meeting => meeting[0]).join("\n")}
          </td>
          <td className={classes.multiline}>
            {section.meetings.map(meeting => {
              return (meeting[1] !== "ON LINE" && meeting[1] !== "TBA") ? (
                <div>
                  <a href={this.genMapLink(meeting[1])} target="_blank">
                    {meeting[1]}
                  </a>
                  <br/>
                </div>
              ) : (
                meeting[1]
              );
            })}
          </td>
          <td className={classes.multiline + " " + classes[section.status.toLowerCase()]}>
            <strong>{`${section.numCurrentlyEnrolled[0]} / ${
              section.maxCapacity
              }`}</strong>
            {`
WL: ${section.numOnWaitlist}
NOR: ${section.numNewOnlyReserved}`}
          </td>
          <td>
            <RstrPopover
              restrictions={section.restrictions}
            />
          </td>
          <td className={classes[section.status.toLowerCase()]}>{this.statusforFindingSpot(section.status, section.classCode)}</td>
        </tr>
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

class MiniSectionTable extends Component {
  constructor(props)
  {
    super(props);
    this.state={  sectionInfo : this.props.courseDetails.sections};
  }

  // shouldComponentUpdate(nextProps, nextState, nextContext) {
  //   return this.props.courseDetails !== nextProps.courseDetails;
  // }
  componentDidMount = async () => {
 let {building,courseCode,courseNum,coursesFull,dept,endTime,ge,instructor,label,startTime,term,units}=this.props.formData;
    if(ge!=="ANY" &&dept===null) //please put all the form's props condition in to prevent search bugs
    {
      const params = {
        department: this.props.courseDetails.name[0],
        term: this.props.termName,
        courseTitle: this.props.courseDetails.name[2],
        courseNum: this.props.courseDetails.name[1]
      };

      const url =
        "https://fanrn93vye.execute-api.us-west-1.amazonaws.com/latest/api/websoc?" +
        querystring.stringify(params);
     await  fetch(url.toString())
        .then(resp => resp.json())
        .then(json => {
          const sections = json.reduce((accumulator, school) => {
            school.departments.forEach(dept => {
              dept.courses.forEach(course => {
                course.sections.forEach(section => {
                 accumulator.push(section);
                });
              });
            });

            return accumulator;
          }, []);

          this.setState({ sectionInfo: sections });
        });
    }
  }

  render() {
    const {classes} = this.props;

    return (
      <Fragment>
        <div
          style={{
            display: "inline-flex"
          }}
        >
          <POPOVER
            name={this.props.name}
            courseDetails={this.props.courseDetails}
          />

          <Typography variant="title" style={{ flexGrow: "2"}}>
            &nbsp;
          </Typography>

          <AlmanacGraphWrapped
            term={this.props.term}
            courseDetails={this.props.courseDetails}
          />

          <Typography variant="title" style={{ flexGrow: "2"}}>
            &nbsp;
          </Typography>

          {this.props.courseDetails.prerequisiteLink ? (
            <Typography variant='h9' style={{flexGrow: "2", marginTop: 9}}>
              <a target="blank" style={{textDecoration: "none", color: "#72a9ed"}}
                 href={this.props.courseDetails.prerequisiteLink} rel="noopener noreferrer">
                Prerequisites
              </a>
            </Typography>
          ) : <Fragment/>
          }
        </div>
        <table className={classes.table}>
          <thead>
          <tr>
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
          {this.state.sectionInfo.map(section => {
            return (
              <ScheduleAddSelector
                classes={classes}
                onAddClass={this.props.onAddClass}
                section={section}
                courseDetails={this.props.courseDetails}
                termName={this.props.termName}
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
