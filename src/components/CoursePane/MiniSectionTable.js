import React, { Component, Fragment } from "react";

import { Block, AddCircle } from "@material-ui/icons";
import { Typography, IconButton, Menu, MenuItem } from "@material-ui/core";
import rmpData from "./RMP.json";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";
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
        this.props.courseDetails.name,
        scheduleNumber,

        this.props.termName
      );
  };

  redirectRMP = (e, name) => {
    if (!e) var e = window.event;
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
Section: ${section.sectionCode}
Units: ${section.units}`}
          </td>
          <td className="multiline">{this.linkRMP(section.instructors)}</td>
          <td className="multiline">
            {section.meetings.map(meeting => meeting[0]).join("\n")}
          </td>
          <td className="multiline">
            {section.meetings.map(meeting => meeting[1]).join("\n")}
          </td>
          <td className={["multiline", section.status].join(" ")}>
            <strong>{`${section.numCurrentlyEnrolled[0]} / ${
              section.maxCapacity
            }`}</strong>
            {`
WL: ${section.numOnWaitlist}
NOR: ${section.numNewOnlyReserved}`}
          </td>
          <td className={section.status}>{section.status}</td>
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
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.props.courseDetails !== nextProps.courseDetails;
  }

  // disableTBA = section => {
  //   //console.log(section.meetings[0] != "TBA", section.meetings[0]);
  //   var test = false;
  //   for (var element of section.meetings[0]) {
  //     if (element === "TBA") {
  //       test = true;
  //       break;
  //     }
  //   }
  //   if (!test) {
  //     return (
  //       <ScheduleAddSelector
  //         onAddClass={this.props.onAddClass}
  //         section={section}
  //         courseDetails={this.props.courseDetails}
  //         termName={this.props.termName}
  //       />
  //     );
  //   } else
  //     return (
  //       <IconButton color="error">
  //         <Block />
  //       </IconButton>
  //     );
  // };

  say = () => {
    console.log("dddd");
  };
  render() {
    const sectionInfo = this.props.courseDetails.sections;

    return (
      <Fragment>
        <div
          style={{
            display: "inline-flex"
          }}
        >
          <Typography variant="title" style={{ flexGrow: "2", marginTop: 12 }}>
            {this.props.name} &nbsp;&nbsp;&nbsp;&nbsp;
          </Typography>
          <AlmanacGraphWrapped
            term={this.props.term}
            courseDetails={this.props.courseDetails}
          />
        </div>
        <table>
          <thead>
            <tr>
              {/* <th className="no_border">{}</th> */}

              <th>Code</th>
              <th>Type</th>
              <th>Instructors</th>
              <th>Times</th>
              <th>Places</th>
              <th>Enrollment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sectionInfo.map(section => {
              return (
                <ScheduleAddSelector
                  onAddClass={this.props.onAddClass}
                  section={section}
                  courseDetails={this.props.courseDetails}
                  termName={this.props.termName}
                />

                //                 <tr onClick={this.say} style={{ cursor: "pointer" }}>
                //                 {this.disableTBA(section)}
                //                   {/* <td className="no_border">{this.disableTBA(section)}</td> */}

                //                   <td>{section.classCode}</td>
                //                   <td className="multiline">
                //                     {`${section.classType}
                // Section: ${section.sectionCode}
                // Units: ${section.units}`}
                //                   </td>
                //                   <td className="multiline">
                //                     {this.linkRMP(section.instructors)}
                //                   </td>
                //                   <td className="multiline">
                //                     {section.meetings.map(meeting => meeting[0]).join("\n")}
                //                   </td>
                //                   <td className="multiline">
                //                     {section.meetings.map(meeting => meeting[1]).join("\n")}
                //                   </td>
                //                   <td className={["multiline", section.status].join(" ")}>
                //                     <strong>{`${section.numCurrentlyEnrolled[0]} / ${
                //                       section.maxCapacity
                //                     }`}</strong>
                //                     {`
                // WL: ${section.numOnWaitlist}
                // NOR: ${section.numNewOnlyReserved}`}
                //                   </td>
                //                   <td className={section.status}>{section.status}</td>
                //                 </tr>
              );
            })}
          </tbody>
        </table>
      </Fragment>
    );
  }
}

export default MiniSectionTable;
