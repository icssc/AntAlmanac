import React, { Component, Fragment } from "react";

import rmpData from "../CoursePane/RMP.json";

import Button from "@material-ui/core/Button";

class showE extends Component {
  constructor(props) {
    super(props);
    this.state = { url: [] };
  }

  redirectRMP = async name => {
    //console.log(name);
    var lastName = name.substring(0, name.indexOf(","));
    var nameP = rmpData[0][name];
    if (nameP != undefined)
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

  render() {
    return (
      <Fragment>
        {this.props.events.map(event => {
          return (
            <div>
              <strong>
                {event.name[0] + " " + event.name[1] + " " + event.name[2]}
              </strong>
              <table>
                <thead>
                  <tr>
                    <th className="no_border">{}</th>
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
                    <td className="no_border">{}</td>
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
                      {event.section.status}
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
