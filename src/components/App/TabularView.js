import React, { Component, Fragment } from 'react'
import ColorPicker from './colorPicker'
import {Button, Menu, MenuItem, Typography} from "@material-ui/core";
import AlmanacGraphWrapped from '../AlmanacGraph/AlmanacGraph'
import rmpData from '../CoursePane/RMP.json'
import locations from '../CoursePane/locations.json'
import RstrPopover from '../CoursePane/RstrPopover'
import POPOVER from '../CoursePane/PopOver'
import Notification from '../Notification'
import {withStyles} from '@material-ui/core/styles';
import { Create } from "@material-ui/icons";
import MouseOverPopover from "../CoursePane/MouseOverPopover";

const styles = {
  colorPicker: {
    '& > div': {
      height: '1.5rem',
      width: '1.5rem',
      borderRadius: '50%',
      margin: 'auto',
    }
  },
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
      verticalAlign: "top",
    },

    "& $colorPicker": {
      verticalAlign: 'middle'
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
  },
  Act: {color: '#c87137'},
  Col: {color: '#ff40b5'},
  Dis: {color: '#8d63f0'},
  Fld: {color: '#1ac805'},
  Lab: {color: '#1abbe9'},
  Lec: {color: '#d40000'},
  Qiz: {color: '#8e5c41'},
  Res: {color: '#ff2466'},
  Sem: {color: '#2155ff'},
  Stu: {color: '#179523'},
  Tap: {color: '#8d2df0'},
  Tut: {color: '#ffc705'}
};

class TabularView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showF: false,
      anchorEl: null
    };
  }
  redirectRMP = (e, name) => {
    if (!e) e = window.event;
    if (e.stopPropagation) e.stopPropagation()

    var lastName = name.substring(0, name.indexOf(','))
    var nameP = rmpData[0][name]
    if (nameP !== undefined)
      window.open('https://www.ratemyprofessors.com' + nameP)
    else
      window.open(
        `https://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university+of+california+irvine&queryoption=HEADER&query=${lastName}&facetSearch=true`
      )
  }

  linkRMP = name => {
    const rmpStyle = {
      textDecoration: 'underline',
      color: '#0645AD',
      cursor: 'pointer'
    }
    return name.map(item => {
      if (item !== 'STAFF') {
        return (
          <div
            style={rmpStyle}
            onClick={e => {
              this.redirectRMP(e, item)
            }}
          >
            {item}
          </div>
        )
      } else return item
    })
  }

  getMapLink = location => {
    try {
      const locationID = locations[location.split(' ')[0]]
      return 'https://map.uci.edu/?id=463#!m/' + locationID
    } catch (err) {
      return 'https://map.uci.edu/?id=463#!ct/12035,12033,11888,0,12034'
    }
  }

  statusforFindingSpot = (section, classCode, termName, name) => {
    if (section === 'FULL')
      return <Notification termName={termName} full={section} code={classCode} name={name}/>
    else
      return section
  }

  getTimeString = event => {
    let startHours = event.start.getHours(), startMinutes = event.start.getMinutes();
    let endHours = event.end.getHours(), endMinutes = event.end.getMinutes();
    if (startMinutes < 10) {startMinutes = `0${startMinutes}`};
    if (endMinutes < 10) {endMinutes = `0${endMinutes}`};
    let startTime = `${(startHours % 12).toString()}:${startMinutes}`;
    let endTime = `${(endHours % 12).toString()}:${endMinutes}`;
    if (endHours > 12) {endTime += "p"};
    return `${event.days.join().replace(",","")} ${startTime}-${endTime}`
  }

  handleDropdownOpen = event => {
    this.setState({anchorEl: event.currentTarget})
  }

  handleDropdownClose = () => {
    this.setState({anchorEl: null})
  }

  render () {
    const {classes} = this.props;
    const events = this.props.eventsInCalendar;
    let result = [];
    let customEvents = [];
    for (let item of events)
      if (!item.isCustomEvent && result.find(function (element) {return element.courseCode === item.courseCode}) === undefined)
        result.push(item);

      else if (item.isCustomEvent) {
        let day = item.start.toDateString().substring(0,1);
        if (day === "T") {day = item.start.toDateString().substring(0,2)};

        let ce = customEvents.find(event => event.customEventID === item.customEventID);
        if ( ce === undefined) {
          item.days = [day];
          customEvents.push(item);
        } else {ce.days.push(day)}; //
      }

    const courses = [];
    let totalUnits = 0;

    for (let course of result) {
      let foundIndex = courses.findIndex(function (element) {
        return (course.name.join() === element.name.join() && element.courseTerm === course.courseTerm)
      })

      if (foundIndex === -1) {
        courses.push({
            name: course.name,
            lecAndDis: [course],
            prerequisiteLink:course.prerequisiteLink,
            final:course.section.finalExam,
            //  courseID:event.courseID,
            courseTerm: course.courseTerm
          }
        )
      } else {
        courses[foundIndex].lecAndDis.push(course)
      }

      if (!isNaN(Number(course.section.units)))
        totalUnits += Number(course.section.units);
    }


    return (
      <Fragment>
        <div
          className={classes.container}
          style={{display:'inline-flex',
            width:"100%",
            position: "relative",
            marginBottom: 10}}>

          <Typography
              variant="title"
              style={{
                position: "absolute",
                width: "50%",
                top: "50%",
                transform: "translateY(-50%)"}}>
            Schedule {this.props.scheduleIndex + 1} ({totalUnits} Units)
          </Typography>

          <Button
            aria-owns={this.state.anchor ? 'simple-menu' : undefined}
            aria-haspopup="true"
            onClick={this.handleDropdownOpen}
            style={{
              position: "absolute",
              top: "50%",
              right: "0",
              transform: "translateY(-50%)"}}>
            Copy Schedule
          </Button>

          <Menu
            id="copyScheduleDropdown"
            anchorEl={this.state.anchorEl}
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleDropdownClose}>

            {[0, 1, 2, 3].map( (index) => {
              return <MenuItem disabled={this.props.scheduleIndex===index} onClick={ () => {
                this.props.onCopySchedule(index)
                this.handleDropdownClose()}}>
                Copy to Schedule {index+1}
              </MenuItem>
            })}

            <MenuItem onClick={ () => {
              this.props.onCopySchedule(4)
              this.handleDropdownClose()}}>
              Copy to All Schedules
            </MenuItem>
          </Menu>
        </div>

        {courses.map(event => {
          return (<div>
            <div
              style={{
                display: 'inline-flex',
                marginTop: 10
              }}
            >
              <POPOVER
                name={event.name[0] + ' ' + event.name[1] + ' | ' + event.name[2]}
                courseDetails={event}
              />

              <Typography variant="title" style={{ flexGrow: "2"}}>
                &nbsp;
              </Typography>

              <AlmanacGraphWrapped
                term={event.courseTerm}
                courseDetails={event}
              />

              <Typography variant="title" style={{ flexGrow: "2"}}>
                &nbsp;
              </Typography>

              {event.prerequisiteLink ? (
                <Typography variant='h9' style={{flexGrow: "2", marginTop: 9}}>
                  <a target="blank" style={{textDecoration: "none", color: "#72a9ed"}}
                     href={event.prerequisiteLink} rel="noopener noreferrer">
                    Prerequisites
                  </a>
                </Typography>
              ) : <Fragment/>
              }
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
              <tbody>{
                event.lecAndDis.map(
                  item => {
                    const secEach = item.section;

                    return (
                      <tr className={classes.tr}>
                        <td className={classes.colorPicker}><ColorPicker onColorChange={this.props.onColorChange} event={item}/></td>
                        <td>{secEach.classCode}</td>
                        <td className={classes.multiline + " " + classes[secEach.classType]}>
                          {`${secEach.classType}
Sec ${secEach.sectionCode}
${secEach.units} units`}
                        </td>
                        <td className={classes.multiline}>
                          {/* {this.linkRMP(secEach.instructors)} */}
                          {secEach.instructors.join('\n')}
                        </td>
                        <td className={classes.multiline}>
                          {secEach.meetings.map(meeting => meeting[0]).join('\n')}
                        </td>
                        <td className={classes.multiline}>
                          {secEach.meetings.map(meeting => {
                            return (meeting[1] !== 'ON LINE' && meeting[1] !== 'TBA') ? (
                              <div>
                                <a href={this.getMapLink(meeting[1])} target="_blank">
                                  {meeting[1]}
                                </a>
                                <br/>
                              </div>
                            ) : (
                              meeting[1]
                            )
                          })}
                        </td>
                        <td>
                  			<MouseOverPopover className={classes.multiline + " " + classes[secEach.status.toLowerCase()]}>
                          {`${secEach.numCurrentlyEnrolled[0]} / ${secEach.maxCapacity}
WL: ${secEach.numOnWaitlist}
NOR: ${secEach.numNewOnlyReserved}`}
			</MouseOverPopover>

                        </td>
                        <td>
                          <RstrPopover
                            restrictions={secEach.restrictions}
                          />
                        </td>
                        <td className={classes[secEach.status.toLowerCase()]}>{this.statusforFindingSpot(secEach.status, secEach.classCode, item.courseTerm, item.name)}</td>
                      </tr>
                    )
                  }
                )
              }</tbody>
            </table>
          </div>)
        })}

       <div>
         <div style={{
           display: 'flex',
           marginTop: 10
         }}>
           <Typography variant="h6">Custom Events</Typography>
         </div>
         <table className={classes.table}>
           <thead>
             <tr>
               <th>Color</th>
               <th>Edit</th>
               <th>Title</th>
               <th>Time</th>
             </tr>
          </thead>
          <tbody>
             {customEvents.map(event => {return (
               <tr className={classes.tr}>
                 <td className={classes.colorPicker} width="50" height="40"><ColorPicker onColorChange={this.props.onColorChange} event={event}/></td>
                 <td width="40"><Button onClick={() => console.log("Temp")}><Create /></Button></td>
                 <td>{event.title}</td>
                 <td>{this.getTimeString(event)}</td>
               </tr>
               )
             })}
          </tbody>
         </table>
       </div>

      </Fragment>
    )
  }
}

export default withStyles(styles)(TabularView);
