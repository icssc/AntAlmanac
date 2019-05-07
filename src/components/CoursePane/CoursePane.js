import React, { Component, Fragment } from 'react';
import loadingGif from './loading.mp4';
import querystring from 'querystring';
import CourseRenderPane from './CourseRenderPane';
import { IconButton, Tooltip } from '@material-ui/core';
import { ArrowBack, Dns, ListAlt, Refresh } from '@material-ui/icons';
import ReactGA from 'react-ga';

class CoursePane extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseData: [],
      loading: 2,
      termName: null,
      deptName: null,
      showDismissButton: true,
      view: 0,
      refresh: false,
      shouldFetch: false,
    };
  }

  handleToggleDismissButton = () => {
    if (this.state.showDismissButton)
      this.setState({ showDismissButton: false });
    else this.setState({ showDismissButton: true });
  };

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
      this.state !== nextState ||
      nextProps.formData !== this.props.formData ||
      nextProps.currentScheduleIndex !== this.props.currentScheduleIndex ||
      nextProps.destination !== this.props.destination
    );
  }

  static flatten(data) {
    return data.reduce((accumulator, school) => {
      accumulator.push(school);

      school.departments.forEach(dept => {
        accumulator.push(dept);

        dept.courses.forEach(course => {
          accumulator.push(course);
        });
      });

      return accumulator;
    }, []);
  }

  // TODO: redesign the way that how we determine when to fetch
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.formData !== this.props.formData || this.state.shouldFetch)
      this.setState({ shouldFetch: false }, () => {
        this.fetchSearch();
      });
  }

  componentDidMount() {
    this.setState({ shouldFetch: this.props.formData !== null });
  }

  fetchSearch = () => {
    const {
      dept,
      term,
      ge,
      courseNum,
      courseCode,
      instructor,
      units,
      endTime,
      startTime,
      coursesFull,
      building,
    } = this.props.formData;

    ReactGA.event({
      category: 'Search',
      action: dept,
      label: term,
    });

    this.setState({ loading: 1 });
    //TODO: Name parity
    const params = {
      department: dept,
      term: term,
      GE: ge,
      courseNum: courseNum,
      courseCodes: courseCode,
      instructorName: instructor,
      units: units,
      endTime: endTime,
      startTime: startTime,
      fullCourses: coursesFull,
      building: building,
    };
    const url =
      'https://fanrn93vye.execute-api.us-west-1.amazonaws.com/latest/api/websoc/?' +
      querystring.stringify(params);
    fetch(url)
      .then(resp => {
        return resp.json();
      })
      .then(jsonObj =>
        this.setState({
          courseData: CoursePane.flatten(jsonObj),
          loading: 2,
          termName: term,
          deptName: dept,
        })
      );
  };

  render() {
    const { loading, courseData } = this.state;

    if (loading === 2) {
      return (
        <Fragment>
          {this.state.showDismissButton ? (
            <div
              style={{
                position: 'sticky',
                width: '100%',
                top: 0,
                zIndex: 3,
                marginBottom: 8,
              }}
            >
              <Tooltip title="Clear Search">
                <IconButton
                  onClick={this.props.onDismissSearchResults}
                  style={{
                    backgroundColor: 'rgba(236, 236, 236, 1)',
                    marginRight: 5,
                    boxShadow: 2,
                  }}
                >
                  <ArrowBack />
                </IconButton>
              </Tooltip>

              {this.state.view ? (
                <Tooltip title="List View">
                  <IconButton
                    onClick={() => this.setState({ view: 0 })}
                    style={{
                      backgroundColor: 'rgba(236, 236, 236, 1)',
                      marginRight: 5,
                      boxShadow: 2,
                    }}
                  >
                    <ListAlt />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Tile View">
                  <IconButton
                    onClick={() => this.setState({ view: 1 })}
                    style={{
                      backgroundColor: 'rgba(236, 236, 236, 1)',
                      marginRight: 5,
                      boxShadow: 2,
                    }}
                  >
                    <Dns />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Refresh Search Results">
                <IconButton
                  onClick={this.fetchSearch}
                  style={{
                    backgroundColor: 'rgba(236, 236, 236, 1)',
                    boxShadow: 2,
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </div>
          ) : (
            <Fragment />
          )}
          <CourseRenderPane
            formData={this.props.formData}
            onAddClass={this.props.onAddClass}
            onToggleDismissButton={this.handleToggleDismissButton}
            courseData={courseData}
            view={this.state.view}
            currentScheduleIndex={this.props.currentScheduleIndex}
            deptName={this.state.deptName}
            termName={this.state.termName}
            destination={this.props.destination}
          />
        </Fragment>
      );
    } else if (loading === 1) {
      return (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <video autoPlay loop>
            <source src={loadingGif} type="video/mp4" />
          </video>
        </div>
      );
    }
  }
}

export default CoursePane;
