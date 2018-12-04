import React, { Component, Fragment } from "react";
import {  IconButton} from "@material-ui/core";
import rmpData from "../CoursePane/RMP.json";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";
import POPOVER from "../CoursePane/PopOver";
import { ArrowBack } from "@material-ui/icons";
import Notification from '../Notification'

//import Button from "@material-ui/core/Button";

class showE extends Component {
  constructor(props) {
    super(props);
    this.state = { url: [] };
  }

  appear =()=>
  {

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
    if(section === 'OPEN')
    {return section;}
    else{
      return <Notification  full={section} code={classCode} name={name}/>
    }
 };
  render() {
    return (
      <Fragment>
        <IconButton style={{ marginRight: 24 }} onClick={this.props.moreInfoF}>
          <ArrowBack />
        </IconButton>
        {this.props.events.map(event => {
          return (
            <div>
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
                <tbody>
                  <tr>
                    <td>{event.courseID}</td>
                    <td className="multiline">
                      {`${event.section.classType}
Sec ${event.section.sectionCode}
${event.section.units} units`}
                    </td>
                    <td className="multiline">
                      {this.linkRMP(event.section.instructors)}
                    </td>
                    <td className="multiline">
                      {event.section.meetings
                        .map(meeting => meeting[0])
                        .join("\n")}
                    </td>
                    <td className="multiline">
                      {event.section.meetings
                        .map(meeting => meeting[1])
                        .join("\n")}
                    </td>
                    <td
                      className={["multiline", event.section.status].join(" ")}
                    >
                      {`${event.section.numCurrentlyEnrolled[0]} / ${
                        event.section.maxCapacity
                      }
WL: ${event.section.numOnWaitlist}
NOR: ${event.section.numNewOnlyReserved}`}
                    </td>
                    <td>{event.section.restrictions}</td>
                    <td className={event.section.status}>
                    {this.statusforFindingSpot(event.section.status,event.section.classCode, event.name)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
     
      
      </Fragment>
    );
  }
}

//TODO: Convert CSS Sheet to JSS
export default showE;
