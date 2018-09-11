import React, { Component, Fragment } from "react";
import AddCircle from "@material-ui/icons/AddCircle";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { getRMP } from "./RMP";
class ScheduleAddSelector extends Component {
  constructor(props) {
    super(props);
    this.state = { anchor: null };
  }

  handleClick = event => {
    this.setState({ anchor: event.currentTarget });
  };

  handleClose = scheduleNumber => {
    this.setState({ anchor: null });
    if (scheduleNumber !== -1)
      this.props.onAddClass(
        this.props.section,
        this.props.courseDetails.name,
        scheduleNumber,
        this.props.deptName,
        this.props.termName
      );
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
  constructor(props) {
    super(props);
    this.state = { url: [] };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.props.courseDetails !== nextProps.courseDetails;
  }

  redirectRMP(e, name) {
    e.preventDefault();
    //console.log(name);
    var foundIndex = this.state.url.findIndex(item => item.fullname === name);

    window.open(this.state.url[foundIndex].link, "_blank");
  }

  linkRMP = name => {
    return name.map(item => {
      if (item !== "STAFF") {
        return (
         
            <div style={{ cursor: "pointer" }}  onClick={event => {
              this.redirectRMP(event, item);
            }}>{item}</div>
         
        );
      } else return item;
    });
  };

  renderRMP = nameA => {
    nameA.forEach(async name => {
      if (name !== "STAFF") {
        var lastName = name.substring(0, name.indexOf(","));
        const firstName = name.charAt(name.length - 2);
        var scraptURL = `http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=university+of+california+irvine&queryoption=HEADER&query=${lastName}&facetSearch=true`;
        var url = await getRMP(firstName, lastName, scraptURL).then(src => src);
        //console.log("this", url);
        if (url.length === 1)
          this.state.url.push({
            fullname: name,
            link: "http://www.ratemyprofessors.com" + url[0]
          });
        else this.state.url.push({ fullname: name, link: scraptURL });
      }
    });
    this.setState({ url: this.state.url }, function() {
      console.log("say", this.state.url);
    });
  };

  render() {
    const sectionInfo = this.props.courseDetails.sections;

    return (
      <table>
        <thead>
          <tr>
            <th className="no_border">{}</th>
            <th>Code</th>
            <th>Type</th>
            <th>Sec</th>
            <th>Units</th>
            <th>Instructors</th>
            <th>Time</th>
            <th>Place</th>
            <th>Enrollment</th>
            <th>Restrictions</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sectionInfo.map(section => {
            this.renderRMP(section.instructors);
            return (
              <tr>
                <td className="no_border">
                  <ScheduleAddSelector
                    onAddClass={this.props.onAddClass}
                    section={section}
                    courseDetails={this.props.courseDetails}
                    deptName={this.props.deptName}
                    termName={this.props.termName}
                  />
                </td>
                <td>{section.classCode}</td>
                <td>{section.classType}</td>
                <td>{section.sectionCode}</td>
                <td>{section.units}</td>
                <td className="multiline">
                  {" "}
                  {this.linkRMP(section.instructors)}
                </td>
                <td className="multiline">
                  {section.meetings.map(meeting => meeting[0]).join("\n")}
                </td>
                <td className="multiline">
                  {section.meetings.map(meeting => meeting[1]).join("\n")}
                </td>
                <td className="multiline">
                  {`${section.numCurrentlyEnrolled[0]} / ${section.maxCapacity}
WL: ${section.numOnWaitlist}
NOR: ${section.numNewOnlyReserved}`}
                </td>
                <td>{section.restrictions}</td>
                <td className={section.status}>{section.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}

//TODO: Convert CSS Sheet to JSS
export default SectionTable;
