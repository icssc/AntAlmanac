import React, { Component, Fragment } from 'react';
import { IconButton, Typography } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import SectionTable from './SectionTable';
import course_info from './course_info.json';
import AlmanacGraphWrapped from '../AlmanacGraph/AlmanacGraph';

class CourseDetailPane extends Component {
  deptInfo = () => {
    let a = undefined;
    try {
      a =
        course_info[this.props.courseDetails.name[0]][
          this.props.courseDetails.name[1]
        ];
    } catch (err) {}

    return a;
  };
  render() {
    return (
      <div
        style={{
          overflow: 'auto',
          height: '100%',
          backgroundColor: 'white',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
          }}
        >
          <IconButton
            style={{ marginRight: 24 }}
            onClick={this.props.onDismissDetails}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="title" style={{ flexGrow: '2', marginTop: 12 }}>
            {this.props.courseDetails.name[0] +
              ' ' +
              this.props.courseDetails.name[1]}
            &nbsp;&nbsp;&nbsp;&nbsp;
          </Typography>
          <AlmanacGraphWrapped
            term={this.props.term}
            courseDetails={this.props.courseDetails}
          />
          {this.props.courseDetails.prerequisiteLink ? (
            <Typography
              variant="title"
              style={{ flexGrow: '2', marginTop: 12 }}
            >
              &nbsp;&nbsp;&nbsp;&nbsp;
              <a
                target="blank"
                style={{ textDecoration: 'none', color: '#72a9ed' }}
                href={this.props.courseDetails.prerequisiteLink}
                rel="noopener noreferrer"
              >
                Prerequisites
              </a>
            </Typography>
          ) : (
            <Fragment />
          )}
        </div>

        <div
          style={{ margin: 20 }}
          className="course_info"
          dangerouslySetInnerHTML={{
            __html: this.deptInfo(),
          }}
        />

        <SectionTable
          style={{ marginTop: 12 }}
          courseDetails={this.props.courseDetails}
          onAddClass={this.props.onAddClass}
          termName={this.props.termName}
          destination={this.props.destination}
        />
      </div>
    );
  }
}

export default CourseDetailPane;
