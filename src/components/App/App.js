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
import gapi from 'gapi-client';
import DomPic from '../AlmanacGraph/DomPic'
import domModel from '../AlmanacGraph/domModel'
import logo from './logo_wide.png';

import {
  getCourseData,
  convertToCalendar,
  getTime,
  editUser,
  getUser,
  getRandom,
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
      autoSaving: false,
      formData: null,
      onLoad: false,
      schedule0Events: [],
      schedule1Events: [],
      schedule2Events: [],
      schedule3Events: [],
      currentScheduleIndex: 0,
      arrayToStore: [],
      backupArray: [],
      arrayOfID: [],
      arrayOfColors0: arrayOfColors.slice(0),
      arrayOfColors1: arrayOfColors.slice(0),
      arrayOfColors2: arrayOfColors.slice(0),
      arrayOfColors3: arrayOfColors.slice(0)
    };
    document.addEventListener("keydown", this.undoEvent, false);
  }

  handleLoad = async () => {
    clearTimeout(this.state.timeOut);
    document.getElementById("idInput").value = "";
    if (this.state.name !== undefined) {
      var myJson = await getUser(this.state.name); //check fetchhelper.js

      //save schedule  to eventsToStore
      //reset everything before loading newdata
      this.setState(
        {
          logIn: true,
          autoSaving: false,
          schedule0Events: [],
          schedule1Events: [],
          schedule2Events: [],
          schedule3Events: [],
          arrayOfID: [],
          backupArray: [],
          arrayToStore: [],
          currentScheduleIndex: 0,
          arrayOfColors0: arrayOfColors.slice(0),
          arrayOfColors1: arrayOfColors.slice(0),
          arrayOfColors2: arrayOfColors.slice(0),
          arrayOfColors3: arrayOfColors.slice(0)
        },
        async function() {
          document.getElementById("introID").innerHTML =
            "Hi! " + this.state.name;
          this.messageSwitch();
          var count = 0;
          myJson.schedules.forEach(async element => {
            var json = 0;
            if (element.customize) {
              const randomNumber = this.setID();
              const dates = getCustomDate(element, randomNumber);
              element.index.forEach(pos => {
                //console.log("dates", dates, pos);
                this.handleAddCustomEvent(dates, pos, element.weekdays);
              });

              //console.log("eveeee", element, this.state.eventsToStore);
            } else {
              json = await getCourseData(element); //check fetchhelper.js
              const section = json[0].departments[0].courses[0].sections[0];
              const courseName = json[0].departments[0].courses[0].name;
              const deptName = json[0].departments[0].name[0];
              const termName = element.courseTerm;
              element.index.forEach(i => {
                this.handleAddClass(section, courseName, i, deptName, termName);
              });
            }
            if (count === myJson.schedules.length - 1) {
              console.log("o");
              this.handleSwitch();
            }
            ++count;
          });
        }
      );
    }
  };

  handleSave = async () => {
    if (this.state.name !== undefined) {
      await getUser(this.state.name); //check fetchhelper.js

      //this.setState({ logIn: true });
      var toSend = [];
      console.log("arraayiddda", this.state.arrayToStore);
      this.state.arrayToStore.forEach(element => {
        if (element.customize) {
          toSend.push({
            title: element.title,
            start: [element.start[0], element.start[1]],
            end: [element.end[0], element.end[1]],
            index: element.index,
            customize: true,
            weekdays: element.weekdays
          });
        } else
          toSend.push({
            courseID: element.courseID,
            courseTerm: element.courseTerm,
            index: element.index,
            customize: false
          });
      });

      console.log("saved", this.state.arrayOfID);
      editUser(this.state.name, toSend);
      //check fetchhelper.js
      this.setState({ logIn: true, autoSaving: false }, function() {
        this.handleSwitch();
        document.getElementById("timeID").innerHTML = getTime();
      });
    }

    //check fetchhelper.js
  };

  //Keyboard shortcuts to undo last delete
  undoEvent = async event => {
    clearTimeout(this.state.timeOut);
    console.log("backupnew", this.state.backupArray);
    if (
      event.keyCode === 90 &&
      (event.ctrlKey || event.metaKey) &&
      this.state.backupArray.length > 0
    ) {
      var obj = this.state.backupArray.pop();
      //console.log("bckobj", obj);
      if (obj.customize) {
        //console.log("array", this.state.eventsToStore);
        const dates = getCustomDate(obj, -1);
        this.setState({ currentScheduleIndex: obj.index }, function() {
          this.handleAddCustomEvent(dates, obj.index, obj, obj.weekdays);
        });
      } else {
        var json = await getCourseData(obj); //check fetchhelper.js
        const section = json[0].departments[0].courses[0].sections[0];
        const courseName = json[0].departments[0].courses[0].name;
        const deptName = json[0].departments[0].name[0];
        const termName = obj.courseTerm;
        //console.log(section, courseName, deptName, termName);
        this.setState({ currentScheduleIndex: obj.index }, function() {
          this.handleAddClass(
            section,
            courseName,
            obj.index,
            deptName,
            termName
          );
        });
      }
      this.setState(
        {
          backupArray: this.state.backupArray
        },
        function() {
          this.autoSaveFunction();
        }
      );
      //console.log("backupnew", this.state.backupEvents);
    }
  };

  handleClassDelete = (courseID, courseTerm) => {
    console.log("this.bac", this.state.arrayToStore);
    clearTimeout(this.state.timeOut);
    let colorFound = false;
    var arrayE = this.state.arrayToStore;
    var foundIndex = arrayE.findIndex(function(element) {
      return element.courseID === courseID && element.courseTerm === courseTerm;
    });

    var indexArr = arrayE[foundIndex].index.filter(
      item => item !== this.state.currentScheduleIndex
    );

    if (!arrayE[foundIndex].customize) {
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
        courseTerm: arrayE[foundIndex].courseTerm,
        index: this.state.currentScheduleIndex,
        start: arrayE[foundIndex].start,
        end: arrayE[foundIndex].end,
        customize: true,
        title: arrayE[foundIndex].title,
        weekdays: arrayE[foundIndex].weekdays
      });
    }

    if (indexArr.length > 0) arrayE[foundIndex].index = indexArr;
    else {
      console.log("dekete");
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
        !event.customize
      ) {
        this.setState({
          ["arrayOfColors" + this.state.currentScheduleIndex]: this.state[
            "arrayOfColors" + this.state.currentScheduleIndex
          ].concat(event.color)
        });
        colorFound = true;
      }
      return event.courseID !== courseID || event.courseTerm !== courseTerm;
    });

    this.setState(
      {
        ["schedule" +
        this.state.currentScheduleIndex +
        "Events"]: classEventsInCalendar,
        arrayToStore: arrayE,
        backupArray: this.state.backupArray
      },
      function() {
        this.autoSaveFunction();
      }
    );
  };

  handleAddClass = (section, name, scheduleNumber, deptName, termName) => {
    console.log("deptname", section, termName);
    if (scheduleNumber === 4) {
      this.handleAddClass(section, name, 0, deptName, termName);
      this.handleAddClass(section, name, 1, deptName, termName);
      this.handleAddClass(section, name, 2, deptName, termName);
      this.handleAddClass(section, name, 3, deptName, termName);
      return;
    }
    console.log("arrtowStore", this.state.arrayToStore);
    var arrayE = this.state.arrayToStore;
    var foundIndex = arrayE.findIndex(function(element) {
      return (
        element.courseID === section.classCode &&
        element.courseTerm === termName
      );
    });

    var randomColor;
    var allowToAdd = false;
    console.log("foundIndex", foundIndex);
    const arrayOfColorsName = "arrayOfColors" + scheduleNumber;
    if (foundIndex > -1) {
      var exist = arrayE[foundIndex].index.findIndex(
        item => item == scheduleNumber
      );
      console.log("exist", exist);
      if (exist < 0) {
        arrayE[foundIndex].index.push(scheduleNumber);
        randomColor = arrayE[foundIndex].color;
        this.state.arrayToStore = arrayE;
        allowToAdd = true;
      }
    } else {
      allowToAdd = true;
      randomColor = this.state[arrayOfColorsName][
        this.state[arrayOfColorsName].length - 1
      ];

      this.state.arrayToStore.push({
        courseID: section.classCode,
        courseTerm: termName,
        index: [scheduleNumber],
        color: randomColor,
        customize: false
      });
    }

    if (allowToAdd) {
      clearTimeout(this.state.timeOut);
      this.setState({
        [arrayOfColorsName]: this.state[arrayOfColorsName].filter(
          color => color !== randomColor
        )
      });
      section.meetings.forEach(meeting => {
        const timeString = meeting[0].replace(/\s/g, "");

        if (timeString !== "TBA") {
          const newClasses = convertToCalendar(
            section,
            timeString,
            randomColor,
            name,
            deptName,
            termName,
            meeting[1]
          );
          this.setState(
            {
              ["schedule" + scheduleNumber + "Events"]: this.state[
                "schedule" + scheduleNumber + "Events"
              ].concat(newClasses)
            },
            function() {
              this.autoSaveFunction();
            }
          );
        }
      });
    }

    this.setState({ arrayToStore: this.state.arrayToStore });
  };

  handleScheduleChange = direction => {
    if (direction === 0) {
      this.setState({
        currentScheduleIndex: (this.state.currentScheduleIndex - 1 + 4)%4
      });
    } else if (direction === 1) {
      this.setState({
        currentScheduleIndex: (this.state.currentScheduleIndex + 1)%4
      });
    }
  };

  updateFormData = formData => {
    this.setState({ formData: formData });
  };

  handleAddCustomEvent = (events, calendarIndex, dates) => {
    if (calendarIndex === 4) {
      this.handleAddCustomEvent(events, 0, dates);
      this.handleAddCustomEvent(events, 1, dates);
      this.handleAddCustomEvent(events, 2, dates);
      this.handleAddCustomEvent(events, 3, dates);
      return;
    }
    clearTimeout(this.state.timeOut);
    var arrayE = this.state.arrayToStore;
    var foundIndex = arrayE.findIndex(function(element) {
      return (
        element.courseID === events[0].courseID &&
        element.courseTerm === events[0].courseTerm
      );
    });

    if (foundIndex > -1) {
      arrayE[foundIndex].index.push(calendarIndex);
      this.state.arrayToStore = arrayE;
    } else {
      this.state.arrayToStore.push({
        title: events[0].title,
        start: [events[0].start.getHours(), events[0].start.getMinutes()],
        end: [events[0].end.getHours(), events[0].end.getMinutes()],
        courseID: events[0].courseID,
        courseTerm: events[0].courseTerm,
        index: [calendarIndex],
        customize: true,
        weekdays: dates
      });
    }

    this.setState({
      ["schedule" + calendarIndex + "Events"]: this.state[
        "schedule" + calendarIndex + "Events"
      ].concat(events),
      arrayToStore: this.state.arrayToStore
    });
  };

  setID = () => {
    var randomNumber = getRandom(this.state.arrayOfID);
    this.state.arrayOfID.push(randomNumber);
    this.setState({ arrayOfID: this.state.arrayOfID });
    return randomNumber;
  };
  handleChange = name => {
    console.log(name.target.value);
    this.setState({ name: name.target.value });
  };

  autoSaveFunction = () => {
    if (
      this.state.name !== undefined &&
      this.state.logIn &&
      this.state.autoSaving
    ) {
      this.setState({
        timeOut: setTimeout(() => {
          this.handleSave();
          document.getElementById("timeID").innerHTML = getTime();
        }, 5000)
      });
    }
  };

  handleSwitch = () => {
    if (this.state.logIn)
      this.setState({ autoSaving: !this.state.autoSaving }, function() {
        this.messageSwitch();
      });
  };

  messageSwitch = () => {
    if (this.state.autoSaving)
      document.getElementById("saveMode").innerHTML = "ON";
    else document.getElementById("saveMode").innerHTML = "OFF";
  };

  render() {
    return (
      <Fragment>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar variant="dense">
            <img src={logo} style={{ flexGrow: 1}} alt="logo" />
            <Typography
              variant="title"
              id="introID"
              color="inherit"
              style={{ flexGrow: 2 }}
            />
            <Button color="inherit" onClick={this.handleSwitch}>
              Auto-saving mode:
            </Button>
            <Typography
              id="saveMode"
              variant="subheading"
              color="inherit"
              style={{ flexGrow: 2 }}
            >
              OFF
            </Typography>
            <span id="timeID" />
            <input type="text" id="idInput" onChange={this.handleChange} />
            <Button color="inherit" onClick={this.handleLoad}>
              Load Schedule
            </Button>
            <Button color="inherit" onClick={this.handleSave}>
              Save Schedule
            </Button>
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
                term = {this.state.formData}
              />
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default App;
