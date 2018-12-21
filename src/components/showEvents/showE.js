import React, { Component, Fragment } from "react";
import {  IconButton, Menu, MenuItem} from "@material-ui/core";
import rmpData from "../CoursePane/RMP.json";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";
import POPOVER from "../CoursePane/PopOver";
import { ArrowBack } from "@material-ui/icons";
import Notification from '../Notification'

//import Button from "@material-ui/core/Button";
class ScheduleAddSelector extends Component {
  constructor(props) {
    super(props);
    this.state = { anchor: null };
  }

  handleClick = event => {
    this.setState({ anchor: event.currentTarget });
    // this.props.onAddClass(
    //   this.props.section,
    //   this.props.courseDetails.name,
    //   0,

    //   this.props.termName
    // );
  };

  handleClose = scheduleNumber => {
    this.setState({ anchor: null });
    if (scheduleNumber !== -1)
      this.props.onAddClass(
        this.props.section,
        this.props.name,
        scheduleNumber,

        this.props.termName
      );
  };

  redirectRMP = (e, name) => {
    if (!e)  e = window.event;
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
    //console.log(section.meetings[0] != "TBA", section.meetings[0]);
    var test = false;
    for (var element of section.meetings[0]) {
      if (element === "TBA") {
        test = true;
        break;
      }
    }
    return test;
  };

  
  statusforFindingSpot = (section,classCode) => {
    if(section === 'FULL')
    return <Notification  full={section} code={classCode} name={this.props.name}/>
    else
    return section;
 };

  render() {
    var section = this.props.section;
    return (
      <Fragment>
        <tr
          {...(!this.disableTBA(section)
            ? { onClick: this.handleClick, style: { cursor: "pointer" } }
            : {})}
        >
          {/* <td className="no_border">{this.disableTBA(section)}</td> */}

          <td>{section.classCode}</td>
          <td className="multiline">
            {`${section.classType}
Sec ${section.sectionCode}
${section.units} units`}
          </td>
          <td className="multiline">
            {this.linkRMP(section.instructors)}
          </td>
          <td className="multiline">
            {section.meetings
              .map(meeting => meeting[0])
              .join("\n")}
          </td>
          <td className="multiline">
            {section.meetings
              .map(meeting => meeting[1])
              .join("\n")}
          </td>
          <td
            className={["multiline", section.status].join(" ")}
          >
            {`${section.numCurrentlyEnrolled[0]} / ${
              section.maxCapacity
            }
WL: ${section.numOnWaitlist}
NOR: ${section.numNewOnlyReserved}`}
          </td>
          <td>   <a
              href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              {section.restrictions}
            </a></td>
          <td className={section.status}>
          {this.statusforFindingSpot(section.status,section.classCode, this.props.name)}
          </td>
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

class showE extends Component {
  constructor(props) {
    super(props);
    this.state = { url: [] };
  }

  redirectRMP = async name => {
    //console.log(name);
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
            onClick={() => {
              this.redirectRMP(item);
            }}
          >
            {item}
          </div>
        );
      } else return item;
    });
  };

  statusforFindingSpot = (section,classCode,name) => {
    if(section === 'FULL')
    return <Notification  full={section} code={classCode} name={name}/>
    else
    return section;
 };




  render() {
    var schedules =[];
    const events = this.props.events;
    for(var i =0;i<4;++i)
    {
     schedules.push(events.filter(event=>event.index.includes(i)));
    }
    var newArr = new Array([],[],[],[]);
   
    var i =0;
    var foundIndex =0;
    for(var schedule of schedules)
    {
      for(var event of schedule)
      {
        foundIndex = newArr[i].findIndex(function(element){
         return ( element.name.join() === event.name.join()&& element.courseTerm ===event.courseTerm);
       });
 
       if(foundIndex == -1)
         {
           newArr[i].push({
             name : event.name,
             section :[event.section],
             courseID:event.courseID,
             courseTerm :event.courseTerm
           }
           );
         }
         else
             newArr[i][foundIndex].section.push(event.section);
      }
      i++;
    }

    return (
      <Fragment>
        <IconButton style={{ marginRight: 24 }} onClick={this.props.moreInfoF}>
          <ArrowBack />
        </IconButton>
        {newArr.map((schedule,index) =>{
     return (<div> {schedule.length>0 ?( <h2>
     Schedule {index + 1}</h2>):null}{schedule.map(event =>{
       return ( <div>
        {/* <strong>
          {event.name[0] + " " + event.name[1] + " " + event.name[2]}
        </strong> */}
        <div
          style={{
            display: "inline-flex"
          }}
        >
          <POPOVER
            name={
             event.name[0] + " " + event.name[1] + " | " + event.name[2]
            }
            courseDetails={event}
          />

          <AlmanacGraphWrapped
            term={event.courseTerm}
            courseDetails={event}
          />
          </div>      
          {/* {event.section.finalExam.length>3 ?(<Typography style={{ margin: "10px 5px 0px 10px" }} variant="button" gutterBottom>
        Final: {event.section.finalExam}
      </Typography>):null} */}
              
              <table>
                <thead>
                  <tr>
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
                <tbody>{event.section.map(section=>
        {return (
          <ScheduleAddSelector
                  onAddClass={this.props.onAddClass}
                  section={section}
                  name={ event.name}
                  termName={ event.courseTerm}
                />

        );})} </tbody></table></div>)
      })}</div>);    
   })}
        {/* {this.showEvent(this.props.events)} */}
      </Fragment>
    );
  }
}

//TODO: Convert CSS Sheet to JSS
export default showE;
