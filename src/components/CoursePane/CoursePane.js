import React, { Component, Fragment } from "react";
import loadingGif from "./loading.mp4";
import querystring from "querystring";
import CourseRenderPane from "./CourseRenderPane";

class CoursePane extends Component {
  constructor(props) {
    super(props);
    this.state = { courseData: null, loading: 0 };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
      this.state !== nextState ||
      nextProps.formData !== this.props.formData ||
      nextProps.view !== this.props.view
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

    if (prevProps.formData !== this.props.formData) {
      this.setState({ loading: 1 });
      const params = { department: dept, term: term, GE: ge };
      const url =
        "https://j4j70ejkmg.execute-api.us-west-1.amazonaws.com/latest/api/websoc/?" +
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
          view={this.props.view}
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
          <video autoPlay>
            <source src={loadingGif} type="video/mp4" />
          </video>
        </div>
      );
    } else {
      return <Fragment />;
    }
  }
}

export default CoursePane;
