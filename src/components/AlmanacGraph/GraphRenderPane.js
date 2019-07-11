import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import PropTypes from 'prop-types';
import Graph from './rechart';

const styles = () => ({
  multiline: {
    whiteSpace: 'pre',
  },
});

class GraphRenderPane extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
    this.state = { open: false, graph: null, data: null };
  }

  componentDidMount() {
    if (this.props.length < 4) {
      this.setState({ open: true }, () => {
        this.fetchGraph(
          this.props.quarter,
          this.props.year,
          this.props.section.classCode
        );
      });
    }
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    if (prevProps !== this.props && this.props.length < 4) {
      this.setState({ open: true }, () => {
        this.fetchGraph(
          this.props.quarter,
          this.props.year,
          this.props.section.classCode
        );
      });
    }
  }

  handleOpen = () => {
    this.setState({ open: !this.state.open }, () => {
      if (this.state.open && this.state.data === null)
        this.fetchGraph(
          this.props.quarter,
          this.props.year,
          this.props.section.classCode
        );
    });
  };
  /*
translateSession(session){
  return (session.substring(5,6) + session.substring(2,4));
}

fetchCourseData() {
    const params = {
        id: this.props.courseDetails.sections[0].classCode,
        tableName: this.translateSession(this.state.term)

    };
    //console.log(this.props.courseDetails)
    console.log(this.props)


    const url =
        "https://cors-anywhere.herokuapp.com/https://8518jpadna.execute-api.us-west-1.amazonaws.com/prod/courseid?" +
        querystring.stringify(params);
    console.log(url);
    console.log(params)

    fetch(url)
        .then(resp => resp.json())
        .then(json => {
          console.log(JSON.stringify(json))
        })
        // .then(json => {
        //     const sections = json.reduce((accumulator, school) => {
        //         school.departments.forEach(dept => {
        //             dept.courses.forEach(course => {
        //                 course.sections.forEach(section => {
        //                     if (section.units !== "0") accumulator.push(section);
        //                 });
        //             });
        //         });
        //
        //         return accumulator;
        //     }, []);
        //
        //     this.setState({length: sections.length}, () => {
        //         this.setState({sections: sections});
        //     });
        // });
        console.log(this.state)
}
  */

  fetchGraph(quarter, year, code) {
    const url1 = `https://almanac-graphs.herokuapp.com/${quarter}${year}/${code}`;

    fetch(url1.toString())
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
