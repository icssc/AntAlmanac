import React, { Component, Fragment } from "react";
import { IconButton, Typography } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import SectionTable from "./SectionTable";
import "./sectiontable.css";
import course_info from "./course_info.json";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";

class CourseDetailPane extends Component {
  getCourseCode = () => {
    const code = [];
    console.log(
      "dsadxcz",
      this.props.deptName,
      this.props.courseDetails.name[0]
    );
    this.props.courseDetails.sections.map(elem => {
      if (elem.units !== "0") code.push(elem.classCode);
    });
    return code;
  };

  render() {
    return (
      <div
        style={{
          overflow: "auto",
          height: "100%",
          backgroundColor: "white"
        }}
      >
        <div
          style={{
            display: "inline-flex"
          }}
        >
          <IconButton
            style={{ marginRight: 24 }}
            onClick={this.props.onDismissDetails}
          >
            <ArrowBack />
          </IconButton>

          <Typography variant="title" style={{ flexGrow: "1", marginTop: 12 }}>
            {this.props.courseDetails.name[0] +
              " " +
              this.props.courseDetails.name[1]}
          </Typography>

          <AlmanacGraphWrapped
            courseCode={this.getCourseCode()}
            term={this.props.term}
            courseDetails={this.props.courseDetails}
          />
        </div>

        <div
          style={{ margin: 20 }}
          className="course_info"
          dangerouslySetInnerHTML={{
            __html:
              course_info[this.props.deptName][this.props.courseDetails.name[0]]
          }}
        />

        <SectionTable
          style={{ marginTop: 12 }}
          courseDetails={this.props.courseDetails}
          onAddClass={this.props.onAddClass}
          termName={this.props.termName}
        />
      </div>
    );
  }
}

export default CourseDetailPane;
