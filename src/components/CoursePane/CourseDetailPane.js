import React, { Component, Fragment } from "react";
import { IconButton, Typography } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import SectionTable from "./SectionTable";
import "./sectiontable.css";
import course_info from "./course_info.json";

class CourseDetailPane extends Component {
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

          <div
            className="course_info"
            style={{ marginTop: 5 }}
            dangerouslySetInnerHTML={{
              __html: course_info[this.props.courseDetails.dept][this.props.courseDetails.name[0]]
            }}
          >
          </div>

        </div>
        <SectionTable
          style={{ marginTop: 12 }}
          courseDetails={this.props.courseDetails}
          onAddClass={this.props.onAddClass}
          deptName={this.props.deptName}
          termName={this.props.termName}
        />
      </div>
    );
  }
}

export default CourseDetailPane;
