import React, { Component, Fragment } from 'react'
import ColorPicker from './colorPicker'
import {Typography, Button} from "@material-ui/core";
import AlmanacGraphWrapped from '../AlmanacGraph/AlmanacGraph'
import rmpData from '../CoursePane/RMP.json'
import locations from '../CoursePane/locations.json'
import RstrPopover from '../CoursePane/RstrPopover'
import POPOVER from '../CoursePane/PopOver'
import Notification from '../Notification'
import FinalSwitch from './FinalSwitch'
import {withStyles} from '@material-ui/core/styles';
import CustomEventsDialog from "../CustomEvents/Popup"
import { Create } from "@material-ui/icons";

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
  }
};

class TabularView extends Component {
  constructor(props) {
    super(props);

    this.state = {
     showF:false
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

 showFinal =schedule=>
 {
   this.setState({showFinal:!this.state.showFinal},()=>{
     if(this.state.showFinal)
     this.props.displayFinal(schedule);
   })
 }

 showCustomEvents = (customEvents, classes) => {
   if (customEvents.length === 0) {
     return
   } else {
       const getTimeString = event => {
         let startHours = event.start.getHours(), startMinutes = event.start.getMinutes();
         let endHours = event.end.getHours(), endMinutes = event.end.getMinutes();
         if (startMinutes < 10) {startMinutes = `0${startMinutes}`};
         if (endMinutes < 10) {endMinutes = `0${endMinutes}`};
         let startTime = `${(startHours % 12).toString()}:${startMinutes}`;
         let endTime = `${(endHours % 12).toString()}:${endMinutes}`;
         if (endHours > 12) {endTime += "p"};
         return `${event.days.join().replace(",","")} ${startTime}-${endTime}`
       }

       return (
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
              </tr>            </thead>
            <tbody>
              {customEvents.map(event => {return (
                <tr className={classes.tr}>
                  <td className={classes.colorPicker} width="50" height="40"><ColorPicker onColorChange={this.props.onColorChange} event={event}/></td>
                  <td width="40"><Button onClick={() => console.log("Temp")}><Create /></Button></td>
                  <td>{event.title}</td>
                  <td>{getTimeString(event)}</td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    }
 }

  render () {

    const events = this.props.classEventsInCalendar

    let result = [];
    let finalSchedule = [];
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

      let final = course.section.finalExam;

      if(final.length>5)
      {
        let [,,, date, start, startMin, end, endMin, ampm] = final.match(/([A-za-z]+) *(\d{1,2}) *([A-za-z]+) *(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/);
        start = parseInt(start, 10);
        startMin = parseInt(startMin, 10);
        end = parseInt(end, 10);
        endMin = parseInt(endMin, 10);
        date = [date.includes('M'), date.includes('Tu'), date.includes('W'), date.includes('Th'), date.includes('F')];
        if (ampm === 'p' && end !== 12) {
          start += 12;
          end += 12;
          if (start > end) start -= 12;
        }

        date.forEach((shouldBeInCal, index) => {
          if(shouldBeInCal)
          finalSchedule.push({
            title:course.title,
            courseType: "Fin",
            courseCode:course.courseCode,
            location:course.location,
            color:course.color,
            isCustomEvent:false,
            start: new Date(2018, 0, index + 1, start, startMin),
            end: new Date(2018, 0, index + 1, end, endMin),
          })
        });
      }

      if (foundIndex === -1) {
        courses.push({
            name: course.name,
            lecAndDis: [course],
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

    const {classes} = this.props;

    return (
      <Fragment>
        <div className={classes.container}>
          <Typography variant="title">
            Schedule {this.props.scheduleIndex + 1} ({totalUnits} Units)
          </Typography>
          <Typography>
            <FinalSwitch  displayFinal={this.props.displayFinal} schedule={finalSchedule} showFinalSchedule = {this.props.showFinalSchedule}/>
          </Typography>
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
                        <td className={classes.multiline}>
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
                        <td className={classes.multiline + " " + secEach.status.toLowerCase()}>
                          {`${secEach.numCurrentlyEnrolled[0]} / ${secEach.maxCapacity}
WL: ${secEach.numOnWaitlist}
NOR: ${secEach.numNewOnlyReserved}`}
                        </td>
                        <td>
                          <RstrPopover
                            restrictions={secEach.restrictions}
                          />
                        </td>
                        <td
                          className={secEach.status.toLowerCase()}>{this.statusforFindingSpot(secEach.status, secEach.classCode, item.courseTerm, item.name)}</td>
                      </tr>
                    )
                  }
                )
              }</tbody>
            </table>
          </div>)
        })}

      {this.showCustomEvents(customEvents, classes)}

      </Fragment>
    )
  }
}

export default withStyles(styles)(TabularView);
