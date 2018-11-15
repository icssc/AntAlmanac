import React, { Component } from "react";
import { Fragment } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
  Grid,
  Toolbar,
  Typography,
  AppBar,
  Paper,
  Tooltip
} from "@material-ui/core";
import SearchForm from "../SearchForm/SearchForm";
import CoursePane from "../CoursePane/CoursePane";
import Calendar from "../Calendar/Calendar";
import { ListAlt, Dns } from "@material-ui/icons";
import Info from "@material-ui/icons/InfoSharp";
import logo_tight from "./logo_tight.png";
import logo_wide from "./logo_wide.png";
import ShowE from "../showEvents/showE";
// pop up for log in
//import LogApp from "../logIn/popUp";
import LoadUser from "../cacheMes/cacheM";
//import LoadApp from "../saveApp/saveButton";
import {
  convertToCalendar,
  saveUserDB,
  getUser,
  getCustomDate,
  getColor,
  getCoursesData
} from "./FetchHelper";
import IconButton from "@material-ui/core/IconButton/IconButton";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: null,
      prevFormData: null,
      schedule0Events: [],
      schedule1Events: [],
      schedule2Events: [],
      schedule3Events: [],
      currentScheduleIndex: 0,
      coursesEvents: [],
      customEvents: [],
      backupArray: [],
      cusID: 0,
      view: 1,
      showMore: false,
      isDesktop: false
    };

    this.resizeLogo = this.resizeLogo.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.undoEvent, false);
    this.resizeLogo();
    window.addEventListener("resize", this.resizeLogo);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.undoEvent, false);
    window.removeEventListener("resize", this.resizeLogo);
  }

  resizeLogo() {
    this.setState({ isDesktop: window.innerWidth > 1000 });
  }

  setView = viewNum => {
    if (this.state.formData != null) this.setState({ view: viewNum });
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  convertToDateObject = schedule => {
    for (var event of schedule) {
      event.start = new Date(event.start);
      event.end = new Date(event.end);
    }
  };

  handleLoad = async name => {
    this.setState(
      {
        schedule0Events: [],
        schedule1Events: [],
        schedule2Events: [],
        schedule3Events: [],
        cusID: 0,
        backupArray: [],
        coursesEvents: [],
        customEvents: [],
        currentScheduleIndex: 0
      },
      async function() {
        var myJson = await getUser(name);
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

          if (myJson.schedules.custom.length > 0) {
            for (var element of myJson.schedules.custom) {
              this.state.cusID += 1;
              element["courseID"] = this.state.cusID;
              const dates = getCustomDate(element, element.courseID);

              element.index.forEach(pos => {
                ob2[pos] = ob2[pos].concat(dates);
              });
              this.state.customEvents.push(element);
            }
          }
          if (myJson.schedules.normal.length > 0) {
            await getCoursesData(
              myJson.schedules.normal,
              ob2,
              this.state.coursesEvents
            );

            this.state.coursesEvents = myJson.schedules.normal;
          }
          this.setState({
            schedule0Events: ob2[0],
            schedule1Events: ob2[1],
            schedule2Events: ob2[2],
            schedule3Events: ob2[3],
            customEvents: this.state.customEvents,
            coursesEvents: this.state.coursesEvents,
            cusID: this.state.cusID
          });
          window.localStorage.setItem("name", name);
        }
      }
    );
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  handleSave = async name => {
    if (
      this.state.customEvents.length > 0 ||
      this.state.coursesEvents.length > 0
    ) {
      window.localStorage.setItem("name", name);

      var toStore = [];

      this.state.customEvents.forEach(element => {
        toStore.push({
          end: element.end,
          index: element.index,
          start: element.start,
          title: element.title,
          weekdays: element.weekdays
        });
      });
      var toSoteN = [];

      this.state.coursesEvents.forEach(element => {
        toSoteN.push({
          color: element.color,
          courseID: element.courseID,
          courseTerm: element.courseTerm,
          index: element.index
        });
      });
      saveUserDB(name, {
        normal: toSoteN,
        custom: toStore
      });
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  undoEvent = event => {
    if (
      this.state.backupArray.length > 0 &&
      (event.keyCode === 90 && (event.ctrlKey || event.metaKey))
    ) {
      this.undoEventHelp();
    }
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////
  undoEventHelp = () => {
    if (this.state.backupArray.length > 0) {
      var obj = this.state.backupArray.pop();
      if (obj.customize) {
        const dates = getCustomDate(obj, -1);
        this.setState(
          {
            currentScheduleIndex: obj.index,
            backupArray: this.state.backupArray
          },
          () => {
            this.handleAddCustomEvent(dates, obj.index, obj.weekdays);
          }
        );
      } else {
        this.setState(
          {
            currentScheduleIndex: obj.index,
            backupArray: this.state.backupArray
          },
          () => {
            this.handleAddClass(
              obj.section,
              obj.name,
              obj.index,
              obj.courseTerm
            );
          }
        );
      }
    }
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  handleClassDelete = (courseID, courseTerm, isCustom) => {
    var arrayE = [];

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
    var backup = this.state.backupArray;
    if (!isCustom) {
      backup = backup.filter(
        item =>
          item.courseID !== courseID ||
          item.courseTerm !== courseTerm ||
          item.index !== this.state.currentScheduleIndex
      );
      backup.push({
        courseID: arrayE[foundIndex].courseID,
        courseTerm: arrayE[foundIndex].courseTerm,
        index: this.state.currentScheduleIndex,
        customize: false,
        section: arrayE[foundIndex].section,
        name: arrayE[foundIndex].name
      });
    } else {
      backup.push({
        courseID: arrayE[foundIndex].courseID,
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
      arrayE.splice(foundIndex, 1);
    }

    const classEventsInCalendar = this.state[
      "schedule" + this.state.currentScheduleIndex + "Events"
    ].filter(event => {
      return event.courseID !== courseID || event.courseTerm !== courseTerm;
    });

    this.setState(
      {
        ["schedule" +
        this.state.currentScheduleIndex +
        "Events"]: classEventsInCalendar,
        backupArray: backup
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
    if (foundIndex > -1) {
      var exist = arrayE[foundIndex].index.findIndex(
        item => item === scheduleNumber
      );
      if (exist < 0) {
        arrayE[foundIndex].index.push(scheduleNumber);
        randomColor = arrayE[foundIndex].color;
        allowToAdd = true;
      }
    } else {
      allowToAdd = true;
      randomColor = getColor();

      arrayE.push({
        courseID: section.classCode,
        courseTerm: termName,
        index: [scheduleNumber],
        color: randomColor,
        section: section,
        name: name
      });
    }

    if (allowToAdd) {
      var cal = [];
      section.meetings.forEach(meeting => {
        const timeString = meeting[0].replace(/\s/g, "");
        const newClasses = convertToCalendar(
          section,
          timeString,
          randomColor,
          name,
          termName,
          meeting[1]
        );
        cal = cal.concat(newClasses);
      });
      this.setState({
        ["schedule" + scheduleNumber + "Events"]: this.state[
          "schedule" + scheduleNumber + "Events"
        ].concat(cal),
        coursesEvents: arrayE
      });
    } else this.setState({ coursesEvents: arrayE });
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
    this.setState({
      showMore: false,
      formData: formData,
      prevFormData: formData
    });
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  handleAddCustomEvent = (events, calendarIndex, dates) => {
    var arrayE = this.state.customEvents;
    var foundIndex = arrayE.findIndex(function(element) {
      return element.courseID === events[0].courseID;
    });

    if (foundIndex > -1) {
      arrayE[foundIndex].index.push(calendarIndex);
    } else {
      arrayE.push({
        title: events[0].title,
        start: [events[0].start.getHours(), events[0].start.getMinutes()],
        end: [events[0].end.getHours(), events[0].end.getMinutes()],
        courseID: events[0].courseID,
        index: [calendarIndex],
        weekdays: dates
      });
    }

    this.setState({
      ["schedule" + calendarIndex + "Events"]: this.state[
        "schedule" + calendarIndex + "Events"
      ].concat(events),
      customEvents: arrayE
    });
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //get id for the custom event
  setID = () => {
    var id = this.state.cusID + 1;
    this.setState({ cusID: id });
    return id;
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // handleChange = name => {
  //   this.setState({ name });
  // };

  clearSchedule = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all the schedules? (you can still recover the schedules by loading from the database)"
      )
    ) {
      // Save it!
      this.setState({
        schedule0Events: [],
        schedule1Events: [],
        schedule2Events: [],
        schedule3Events: [],
        cusID: 0,
        backupArray: [],
        coursesEvents: [],
        customEvents: [],
        currentScheduleIndex: 0
      });
    } else {
    }
  };

  moreInfoF = () => {
    this.setState({ showMore: !this.state.showMore }, function() {
      if (this.state.showMore === true) this.setState({ formData: null });
      else this.setState({ formData: this.state.prevFormData });
    });
  };

  render() {
    return (
      <Fragment>
        <CssBaseline />
        <AppBar position="static" style={{ marginBottom: 8 }}>
          <Toolbar variant="dense">
            <div>
              {this.state.isDesktop ? (
                <img
                  src={logo_wide}
                  style={{ height: 35, width: 394 }}
                  alt="XD"
                />
              ) : (
                <img
                  src={logo_tight}
                  style={{ height: 45, width: 202 }}
                  alt=":("
                />
              )}
            </div>

            <Typography
              variant="title"
              id="introID"
              color="inherit"
              style={{ flexGrow: 2 }}
            />
            <LoadUser load={this.handleLoad} save={this.handleSave} />

            {/* <LogApp act={this.handleChange} load={this.handleLoad} />

            <LoadApp act={this.handleChange} save={this.handleSave} /> */}

            <Tooltip title="Info Page">
              <a
                style={{ color: "white" }}
                href={"https://the-antalmanac.herokuapp.com/index.html"}
                target="_blank"
              >
                <Info fontSize="48px" color="white" />
              </a>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Grid container>
          <SearchForm updateFormData={this.updateFormData} />
          <Grid item lg={6} xs={12}>
            <div style={{ margin: "10px 5px 0px 10px" }}>
              <Calendar
                classEventsInCalendar={
                  this.state[
                    "schedule" + this.state.currentScheduleIndex + "Events"
                  ]
                }
                moreInfoF={this.moreInfoF}
                clickToUndo={this.undoEventHelp}
                currentScheduleIndex={this.state.currentScheduleIndex}
                onClassDelete={this.handleClassDelete}
                onScheduleChange={this.handleScheduleChange}
                onAddCustomEvent={this.handleAddCustomEvent}
                setID={this.setID}
                clear={this.clearSchedule}
              />
            </div>
          </Grid>

          <Grid item lg={6} xs={12}>
            <Paper style={{ overflow: "hidden", margin: "10px 10px 0px 5px" }}>
              <Toolbar variant="dense" style={{ backgroundColor: "#5191d6" }}>
                <Tooltip title="List View">
                  <IconButton onClick={() => this.setView(0)}>
                    <ListAlt />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Tile View">
                  <IconButton onClick={() => this.setView(1)}>
                    <Dns />
                  </IconButton>
                </Tooltip>
              </Toolbar>
            </Paper>
            <Paper
              style={{
                height: "80vh",
                overflow: "auto",
                margin: "10px 10px 0px 5px",
                padding: 10
              }}
              id="foo1"
            >
              {this.state.showMore ? (
                <ShowE events={this.state.coursesEvents} />
              ) : (
                <CoursePane
                  view={this.state.view}
                  formData={this.state.formData}
                  onAddClass={this.handleAddClass}
                  term={this.state.formData}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default App;
