import React, { Component } from "react";
import { Fragment } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import SearchForm from "../SearchForm/SearchForm";
import CoursePane from "../CoursePane/CoursePane";
import Calendar from "../Calendar/Calendar";
import Paper from "@material-ui/core/Paper";
import Popup from "../CustomEvents/Popup";
import Button from "@material-ui/core/Button";
import DomPic from '../AlmanacGraph/DomPic'
import domModel from '../AlmanacGraph/domModel'
import Tooltip from '@material-ui/core/Tooltip';
import logo from './logo_wide.png';
// pop up for log in 
import LogApp from '../logIn/popUp'
import Info from '@material-ui/icons/InfoSharp';



import {
  getCourseData,
  convertToCalendar,
  getTime,
  saveUserDB,
  getUser,
  getCustomDate
} from "./FetchHelper";
import {
  red,
  pink,
  purple,
  indigo,
  deepPurple,
  blue,
  green,
  cyan,
  teal,
  lightGreen,
  lime,
  amber,
  blueGrey
} from "@material-ui/core/colors";

const arrayOfColors = [
  red[500],
  pink[500],
  purple[500],
  indigo[500],
  deepPurple[500],
  blue[500],
  green[500],
  cyan[500],
  teal[500],
  lightGreen[500],
  lime[500],
  amber[500],
  blueGrey[500]
];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      logIn: false,
      timeOut: undefined,
      name: undefined,
      formData: null,
      schedule0Events: [],
      schedule1Events: [],
      schedule2Events: [],
      schedule3Events: [],
      currentScheduleIndex: 0,
      coursesEvents: [],
      customEvents: [],
      backupArray: [],
      arrayOfID: [0],
      arrayOfColors0: arrayOfColors.slice(0),
      arrayOfColors1: arrayOfColors.slice(0),
      arrayOfColors2: arrayOfColors.slice(0),
      arrayOfColors3: arrayOfColors.slice(0)
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.undoEvent, false);
  }
  componentWillUnmount() {
    document.addEventListener("keydown", this.undoEvent, false);
  }

  handleLoad = async () => {
    if (this.state.name !== undefined) {
      this.setState(
        {
          logIn: true,
          schedule0Events: [],
          schedule1Events: [],
          schedule2Events: [],
          schedule3Events: [],
          arrayOfID: [0],
          backupArray: [],
          coursesEvents: [],
          customEvents: [],
          currentScheduleIndex: 0,
          arrayOfColors0: arrayOfColors.slice(0),
          arrayOfColors1: arrayOfColors.slice(0),
          arrayOfColors2: arrayOfColors.slice(0),
          arrayOfColors3: arrayOfColors.slice(0)
        },
        async function() {
          var myJson = await getUser(this.state.name);
          var test = false;
          for (var prop in myJson) {
            if (myJson.hasOwnProperty(prop)) {
              test = true;
              break;
            }
          }
          if (test) {
            var ob2 = new Array(4);
            ob2[0] = [];
            ob2[1] = [];
            ob2[2] = [];
            ob2[3] = [];
            var arrayOFID = [0];
            var colors = new Array(4);
            colors[0] = this.state.arrayOfColors0;
            colors[1] = this.state.arrayOfColors1;
            colors[2] = this.state.arrayOfColors2;
            colors[3] = this.state.arrayOfColors3;

            for (var element of myJson.schedules.custom) {
              const dates = getCustomDate(element, element.courseID);

              arrayOFID.push(element.courseID);

              element.index.forEach(pos => {
                ob2[pos] = ob2[pos].concat(dates);
              });
              this.state.customEvents.push(element);
            }

            for (var element of myJson.schedules.normal) {
              var json = await getCourseData(element);
              const section = json[0].departments[0].courses[0].sections[0];
              const courseName = json[0].departments[0].courses[0].name;
              const termName = element.courseTerm;

              element.index.forEach(pos => {
                colors[pos] = colors[pos].filter(
                  color => color !== element.color
                );
                section.meetings.forEach(meeting => {
                  const timeString = meeting[0].replace(/\s/g, "");
                  colors.push(element.color);
                  const newClasses = convertToCalendar(
                    section,
                    timeString,
                    element.color,
                    courseName,
                    termName,
                    meeting[1]
                  );

                  ob2[pos] = ob2[pos].concat(newClasses);
                });
              });
              this.state.coursesEvents.push(element);
            }

            this.setState({
              schedule0Events: ob2[0],
              schedule1Events: ob2[1],
              schedule2Events: ob2[2],
              schedule3Events: ob2[3],
              customEvents: this.state.customEvents,
              coursesEvents: this.state.coursesEvents,
              arrayOfID: arrayOFID,
              arrayOfColors0: colors[0],
              arrayOfColors1: colors[1],
              arrayOfColors2: colors[2],
              arrayOfColors3: colors[3]
            });
          }
        }
      );
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  handleSave = async () => {
    if (this.state.name !== undefined) {
      saveUserDB(this.state.name, {
        normal: this.state.coursesEvents,
        custom: this.state.customEvents
      });
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  undoEvent = async event => {
    if (
      event.keyCode === 90 &&
      (event.ctrlKey || event.metaKey) &&
      this.state.backupArray.length > 0
    ) {
      var obj = this.state.backupArray.pop();
      if (obj.customize) {
        const dates = getCustomDate(obj, -1);
        this.setState({ currentScheduleIndex: obj.index }, function() {
          this.handleAddCustomEvent(dates, obj.index, obj.weekdays);
        });
      } else {
        var json = await getCourseData(obj); //check fetchhelper.js

        const section = json[0].departments[0].courses[0].sections[0];
        const courseName = json[0].departments[0].courses[0].name;
        const deptName = json[0].departments[0].name[0];
        const termName = obj.courseTerm;
        this.setState({ currentScheduleIndex: obj.index }, function() {
          this.handleAddClass(section, courseName, obj.index, termName);
        });
      }
      this.setState({
        backupArray: this.state.backupArray
      });
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  handleClassDelete = (courseID, courseTerm, isCustom) => {
    let colorFound = false;
    var arrayE = [1];

    if (isCustom) arrayE = this.state.customEvents;
    else arrayE = this.state.coursesEvents;

    var foundIndex = arrayE.findIndex(function(element) {
      return (
        element.courseID === courseID &&
        (isCustom || element.courseTerm === courseTerm)
      );
    });

    var indexArr = arrayE[foundIndex].index.filter(
      item => item !== this.state.currentScheduleIndex
    );

    if (!isCustom) {
      this.state.backupArray = this.state.backupArray.filter(
        item =>
          item.courseID !== courseID ||
          item.courseTerm !== courseTerm ||
          item.index !== this.state.currentScheduleIndex
      );
      this.state.backupArray.push({
        courseID: arrayE[foundIndex].courseID,
        courseTerm: arrayE[foundIndex].courseTerm,
        index: this.state.currentScheduleIndex,
        customize: false
      });
    } else {
      this.state.backupArray.push({
        courseID: arrayE[foundIndex].courseID,
        index: this.state.currentScheduleIndex,
        start: arrayE[foundIndex].start,
        end: arrayE[foundIndex].end,
        customize: true,
        title: arrayE[foundIndex].title,
        weekdays: arrayE[foundIndex].weekdays
      });
    }
    var colorR = false;
    if (indexArr.length > 0) arrayE[foundIndex].index = indexArr;
    else {
      colorR = true;
      arrayE.splice(foundIndex, 1);
    }

    const classEventsInCalendar = this.state[
      "schedule" + this.state.currentScheduleIndex + "Events"
    ].filter(event => {
      if (
        !colorFound &&
        event.courseID === courseID &&
        event.courseTerm === courseTerm &&
        event.color !== undefined &&
        !event.customize &&
        colorR
      ) {
        this.state[
          "arrayOfColors" + this.state.currentScheduleIndex
        ] = this.state[
          "arrayOfColors" + this.state.currentScheduleIndex
        ].concat(event.color);
        colorFound = true;
      }
      return event.courseID !== courseID || event.courseTerm !== courseTerm;
    });

    this.setState(
      {
        ["schedule" +
        this.state.currentScheduleIndex +
        "Events"]: classEventsInCalendar,
        backupArray: this.state.backupArray,
        ["arrayOfColors" + this.state.currentScheduleIndex]: this.state[
          "arrayOfColors" + this.state.currentScheduleIndex
        ]
      },
      function() {
        if (isCustom) this.setState({ customEvents: arrayE });
        else this.setState({ coursesEvents: arrayE });
      }
    );
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  handleAddClass = (section, name, scheduleNumber, termName) => {
    if (scheduleNumber === 4) {
      this.handleAddClass(section, name, 0, termName);
      this.handleAddClass(section, name, 1, termName);
      this.handleAddClass(section, name, 2, termName);
      this.handleAddClass(section, name, 3, termName);
      return;
    }
    var arrayE = this.state.coursesEvents;
    var foundIndex = arrayE.findIndex(function(element) {
      return (
        element.courseID === section.classCode &&
        element.courseTerm === termName
      );
    });

    var randomColor;
    var allowToAdd = false;
    const arrayOfColorsName = "arrayOfColors" + scheduleNumber;
    if (foundIndex > -1) {
      var exist = arrayE[foundIndex].index.findIndex(
        item => item == scheduleNumber
      );
      if (exist < 0) {
        arrayE[foundIndex].index.push(scheduleNumber);
        randomColor = arrayE[foundIndex].color;
        this.state.coursesEvents = arrayE;
        allowToAdd = true;
      }
    } else {
      allowToAdd = true;
      randomColor = this.state[arrayOfColorsName][
        this.state[arrayOfColorsName].length - 1
      ];

      this.state.coursesEvents.push({
        courseID: section.classCode,
        courseTerm: termName,
        index: [scheduleNumber],
        color: randomColor
      });
    }

    if (allowToAdd) {
      this.setState({
        [arrayOfColorsName]: this.state[arrayOfColorsName].filter(
          color => color !== randomColor
        )
      });
      var cal = [];
      section.meetings.forEach(meeting => {
        const timeString = meeting[0].replace(/\s/g, "");

        if (timeString !== "TBA") {
          const newClasses = convertToCalendar(
            section,
            timeString,
            randomColor,
            name,
            termName,
            meeting[1]
          );

          cal = cal.concat(newClasses);
        }
      });
      this.setState({
        ["schedule" + scheduleNumber + "Events"]: this.state[
          "schedule" + scheduleNumber + "Events"
        ].concat(cal)
      });
    }

    this.setState({ coursesEvents: this.state.coursesEvents });
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  handleScheduleChange = direction => {
    if (direction === 0) {
      this.setState({
        currentScheduleIndex: (this.state.currentScheduleIndex - 1 + 4) % 4
      });
    } else if (direction === 1) {
      this.setState({
        currentScheduleIndex: (this.state.currentScheduleIndex + 1) % 4
      });
    }
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  updateFormData = formData => {
    this.setState({ formData: formData });
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  handleAddCustomEvent = (events, calendarIndex, dates) => {
    var arrayE = this.state.customEvents;
    var foundIndex = arrayE.findIndex(function(element) {
      return element.courseID === events[0].courseID;
    });

    if (foundIndex > -1) {
      arrayE[foundIndex].index.push(calendarIndex);
      this.state.customEvents = arrayE;
    } else {
      this.state.customEvents.push({
        title: events[0].title,
        start: [events[0].start.getHours(), events[0].start.getMinutes()],
        end: [events[0].end.getHours(), events[0].end.getMinutes()],
        courseID: events[0].courseID,
        index: [calendarIndex],
        weekdays: dates
      });
    }
    this.state["schedule" + calendarIndex + "Events"].concat(events);

    this.setState({
      ["schedule" + calendarIndex + "Events"]: this.state[
        "schedule" + calendarIndex + "Events"
      ].concat(events)
    });
    this.setState({ customEvents: this.state.customEvents }, function() {});
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //get id for the custom event
  setID = () => {
    var id = this.state.arrayOfID[this.state.arrayOfID.length - 1] + 1;
    this.state.arrayOfID.push(id);
    this.setState({ arrayOfID: this.state.arrayOfID });
    return id;
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  handleChange = name => {
    this.setState({ name, logIn: true });
  };

  render() {
    return (
      <Fragment>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar variant="dense">
            <img
              src={logo}
              style={{ width: 478, height: 79, margin: 3 }}
              alt="logo"
            />
            <Typography
              variant="title"
              id="introID"
              color="inherit"
              style={{ flexGrow: 2 }}
            />

            <LogApp act={this.handleChange} load={this.handleLoad} />

            <LoadApp act={this.handleChange} save={this.handleSave} />

         

            </Typography>
            <span id="timeID" />

            <LogApp act={this.handleChange} />
            <Button color="inherit" onClick={this.handleLoad}>
              Load 
            </Button>
            <Button color="inherit" onClick={this.handleSave}>
              Save 
            </Button>
            <Tooltip title="Info">
            <a style={{color:'white'}}href={'https://almanac-team.herokuapp.com/index.html'} target="_blank" ><Info fontSize="48px" color="white"/></a>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Grid container>
          <Grid item lg={12}>
            <SearchForm updateFormData={this.updateFormData} />
          </Grid>
          <Grid item lg={6} xs={12}>
            <div style={{ margin: "10px 5px 0px 10px" }}>
              <Calendar
                classEventsInCalendar={
                  this.state[
                    "schedule" + this.state.currentScheduleIndex + "Events"
                  ]
                }
                currentScheduleIndex={this.state.currentScheduleIndex}
                onClassDelete={this.handleClassDelete}
                onScheduleChange={this.handleScheduleChange}
                onAddCustomEvent={this.handleAddCustomEvent}
                setID={this.setID}
              />
            </div>
          </Grid>

          <Grid item lg={6} xs={12}>
            <Paper
              style={{
                height: "85vh",
                overflow: "auto",
                margin: "10px 10px 0px 5px",
                padding: 10
              }}
            >
              <CoursePane
                formData={this.state.formData}
                onAddClass={this.handleAddClass}
                term={this.state.formData}
              />
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default App;
