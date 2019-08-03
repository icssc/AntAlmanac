import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import querystring from 'querystring';
import { Image } from '@material-ui/icons';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { Modal, Button, Typography } from '@material-ui/core';
import GraphModalContent from './GraphModalContent';

const styles = (theme) => ({
  flex: { flexGrow: 1 },
});

class AlmanacGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      term: '2018 Fall',
      sections: [],
      length: 0,
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.fetchCourseData = this.fetchCourseData.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  fetchCourseData() {
    const params = {
      department: this.props.courseDetails.name[0],
      term: this.state.term,
      courseTitle: this.props.courseDetails.name[2],
      courseNum: this.props.courseDetails.name[1],
    };

    const url =
      'https://fanrn93vye.execute-api.us-west-1.amazonaws.com/latest/api/websoc?' +
      querystring.stringify(params);

    fetch(url.toString())
      .then((resp) => resp.json())
      .then((json) => {
        const sections = json.reduce((accumulator, school) => {
          school.departments.forEach((dept) => {
            dept.courses.forEach((course) => {
              course.sections.forEach((section) => {
                if (section.units !== '0') accumulator.push(section);
              });
            });
          });

          return accumulator;
        }, []);

        this.setState({ length: sections.length }, () => {
          this.setState({ sections: sections });
        });
      });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value }, () => {
      this.fetchCourseData();
    });
  }

  handleOpen() {
    this.setState({ open: true });
    this.fetchCourseData();
    ReactGA.event({
      category: 'Pass_enrollment',
      action:
        this.props.courseDetails.name[0] +
        ' ' +
        this.props.courseDetails.name[1],
      label: this.state.term,
    });
  }

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    return (
      <Fragment>
        <Typography className={this.props.classes.flex} />
        <Button
          variant="contained"
          onClick={this.handleOpen}
          style={{ backgroundColor: '#f8f17c', boxShadow: 'none' }}
        >
          Past Enrollment&nbsp;&nbsp;
          <Image fontSize="small" />
        </Button>

        <Modal open={this.state.open} onClose={this.handleClose}>
          <GraphModalContent
            fetchCourseData={this.fetchCourseData}
            term={this.state.term}
            sections={this.state.sections}
            length={this.state.length}
            courseDetails={this.props.courseDetails}
            handleChange={this.handleChange}
          />
        </Modal>
      </Fragment>
    );
  }
}

AlmanacGraph.propTypes = {
  courseDetails: PropTypes.shape({
    name: PropTypes.array,
    comment: PropTypes.string,
    sections: PropTypes.object,
    prerequisiteLink: PropTypes.string,
  }),
};

export default withStyles(styles)(AlmanacGraph);
