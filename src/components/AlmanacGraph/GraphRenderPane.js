import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import PropTypes from 'prop-types';
import Graph from './rechart';
import querystring from 'querystring';

const styles = () => ({
  multiline: {
    whiteSpace: 'pre',
  },
});

class GraphRenderPane extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, graph: null, data: null }; // default values
    this.fetchCourseData = this.fetchCourseData.bind(this);
  }

  componentDidMount() {
    if (this.props.length < 4) {
      //Need someone to look into this and why this exists
      this.setState({ open: false }, () => {
        this.fetchCourseData(
          this.props.section.classCode,
          this.props.quarter.toUpperCase() + this.props.year
        );
      });
    }
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    if (prevProps !== this.props && this.props.length < 4) {
      //Need someone to look into this and why this exists
      this.setState({ open: true }, () => {
        this.fetchCourseData(
          this.props.section.classCode,
          this.props.quarter.toUpperCase() + this.props.year
        );
      });
    }
  }

  handleOpen = () => {
    // what happens when open/close button pressed
    //TODO: seperate open and close
    this.setState({ open: !this.state.open }, () => {
      if (this.state.open && this.state.data === null) {
        this.fetchCourseData(
          this.props.section.classCode,
          this.props.quarter.toUpperCase() + this.props.year
        );
      }
    });
  };

  fetchCourseData(courseID, session) {
    //Get the course Data
    const params = {
      id: courseID,
      tableName: session,
    };
    const url =
      'https://cors-anywhere.herokuapp.com/https://8518jpadna.execute-api.us-west-1.amazonaws.com/prod/courseid?' +
      querystring.stringify(params);
    fetch(url.toString())
      .then((resp) => resp.json())
      .then((json) => {
        this.setState({
          data: json,
        });
      });
  }

  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Type</th>
              <th>Instructors</th>
              <th>Times</th>
              <th>Places</th>
              <th>Max Cap</th>
            </tr>
            <tr>
              <td className={this.props.classes.multiline}>
                {`${this.props.section.classType}
Section: ${this.props.section.sectionCode}
Units: ${this.props.section.units}`}
              </td>
              <td className={this.props.classes.multiline}>
                {this.props.section.instructors.join('\n')}
              </td>
              <td className={this.props.classes.multiline}>
                {this.props.section.meetings
                  .map((meeting) => meeting[0])
                  .join('\n')}
              </td>
              <td className={this.props.classes.multiline}>
                {this.props.section.meetings
                  .map((meeting) => meeting[1])
                  .join('\n')}
              </td>
              <td>{this.props.section.maxCapacity}</td>
            </tr>
          </tbody>
        </table>
        {
          <div>
            <Button variant="contained" onClick={() => this.handleOpen()}>
              OPEN/CLOSE
            </Button>
            {this.state.open ? <Graph rawData={this.state.data} /> : null}
          </div>
        }
      </div>
    );
  }
}

GraphRenderPane.propTypes = {
  section: PropTypes.shape({
    meetings: PropTypes.array,
    classCode: PropTypes.string,
    classType: PropTypes.string,
    sectionCode: PropTypes.string,
    units: PropTypes.string,
    instructors: PropTypes.array,
    numCurrentlyEnrolled: PropTypes.string,
    maxCapacity: PropTypes.string,
    numOnWaitlist: PropTypes.string,
    numNewOnlyReserved: PropTypes.string,
    restrictions: PropTypes.string,
    status: PropTypes.string,
  }),
  length: PropTypes.number,
  quarter: PropTypes.string,
  year: PropTypes.string,
};

export default withStyles(styles)(GraphRenderPane);
