import React, { Component, Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Tooltip, Grid } from "@material-ui/core";
import querystring from "querystring";
import { Help } from "@material-ui/icons";

import {
  Modal,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from "@material-ui/core";
import GraphRenderPane from "./GraphRenderPane";

const styles = theme => ({
  paper: {
    position: "absolute",
    overflow: "auto",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "75%",
    height: "85%",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4
  }
});

class AlmanacGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      term: "2018 Winter",
      sections: []
    };
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.fetchCourseData = this.fetchCourseData.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.fetchCourseData();
  }

  fetchCourseData() {
    const params = {
      department: this.props.courseDetails.name[0],
      term: this.state.term,
      courseTitle: this.props.courseDetails.name[2],
      courseNum: this.props.courseDetails.name[1]
    };

    const url =
      "https://j4j70ejkmg.execute-api.us-west-1.amazonaws.com/latest/api/websoc?" +
      querystring.stringify(params);
    // console.log(url);

    fetch(url.toString())
      .then(resp => resp.json())
      .then(json => {
        const sections = json.reduce((accumulator, school) => {
          school.departments.forEach(dept => {
            dept.courses.forEach(course => {
              course.sections.forEach(section => {
                if (section.units !== "0") accumulator.push(section);
              });
            });
          });

          return accumulator;
        }, []);

        this.setState({ sections: sections });
      });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value }, () =>
      this.fetchCourseData()
    );
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    return (
      <Fragment>
        <Typography style={{ flexGrow: 1 }} />
        <Button variant="contained" onClick={this.handleOpen}>
          Past Enrollment
        </Button>

        <Modal open={this.state.open} onClose={this.handleClose}>
          <Paper className={this.props.classes.paper}>
            <Typography variant="title" style={{ flexGrow: "1" }}>
              {"Historical Enrollments for " +
                this.props.courseDetails.name[0] +
                " " +
                this.props.courseDetails.name[1] +
                "   "}

              <Tooltip title="Need Help with Graphs?">
                <a
                  href="https://the-antalmanac.herokuapp.com/index.html#support"
                  target="_blank"
                  style={{ color: "black" }}
                >
                  <Help fontSize="48px" />
                </a>
              </Tooltip>
            </Typography>

            <FormControl fullWidth>
              <InputLabel htmlFor="term-select">Term</InputLabel>
              <Select
                value={this.state.term}
                onChange={this.handleChange}
                inputProps={{ name: "term", id: "term-select" }}
              >
                <MenuItem value={"2018 Fall"}>2018 Fall Quarter</MenuItem>
                <MenuItem value={"2018 Spring"}>2018 Spring Quarter</MenuItem>
                <MenuItem value={"2018 Winter"}>2018 Winter Quarter</MenuItem>
              </Select>
            </FormControl>

            {this.state.sections.length === 0 ? (
              <div
                style={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Typography variant="h1">
                  {"This course was not offered in " + this.state.term}
                </Typography>
              </div>
            ) : (
              <div>
                {this.state.sections.map(section => (
                  <GraphRenderPane
                    section={section}
                    quarter={this.state.term[5].toLowerCase()}
                    year={this.state.term.substring(2, 4)}
                  />
                ))}
              </div>
            )}
          </Paper>
        </Modal>
      </Fragment>
    );
  }
}

export default withStyles(styles)(AlmanacGraph);
