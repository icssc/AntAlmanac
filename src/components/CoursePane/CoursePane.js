import React, { Component, Fragment } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import CourseRenderPane from "./CourseRenderPane";

class CoursePane extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseData: null,
      loading: 0,
      termName: null,
      deptName: null
    };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
      this.state !== nextState || nextProps.formData !== this.props.formData
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { dept, term, ge } = this.props.formData;

    if (prevProps !== this.props) {
      this.setState({ loading: 1 });
      const url = new URL(
        "https://j4j70ejkmg.execute-api.us-west-1.amazonaws.com/latest/api/websoc/?"
      );

      const params = { department: dept, term: term, GE: ge };
      Object.keys(params).forEach(key =>
        url.searchParams.append(key, params[key])
      );

      fetch(url.toString())
        .then(resp => {
          return resp.json();
        })
        .then(jsonObj =>
          this.setState({
            courseData: CoursePane.flatten(jsonObj),
            loading: 2,
            termName: term,
            deptName: dept
          })
        );
    }
  }

  render() {
    const { loading, courseData } = this.state;

    if (loading === 2) {
      return (
        <CourseRenderPane
          onAddClass={this.props.onAddClass}
          courseData={courseData}
          deptName={this.state.deptName}
          termName={this.state.termName}
          term={this.props.term}
        />
      );
    } else if (loading === 1) {
      return (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <CircularProgress size={50} />
        </div>
      );
    } else {
      return <Fragment />;
    }
  }
}

export default CoursePane;
