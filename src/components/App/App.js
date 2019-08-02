import React, { Component, Suspense, Fragment } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {
  Grid,
  Toolbar,
  AppBar,
  Tooltip,
  Tabs,
  Hidden,
  Tab,
  Typography,
  Button,
  CircularProgress,
} from '@material-ui/core';
import {
  Info,
  Search,
  CalendarToday,
  Assignment,
  FormatListBulleted,
  Map,
} from '@material-ui/icons';
import ReactGA from 'react-ga';
import LoadSaveScheduleFunctionality from '../cacheMes/LoadSaveFunctionality';
import { saveUserData } from './FetchHelper';
import loadingGif from '../CoursePane/loading.mp4';
import Logo_tight from './logo_tight.png';
import Logo_wide from './logo_wide.png';
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
  blueGrey,
} from '@material-ui/core/colors';
import SearchForm from '../SearchForm/SearchForm';
import UCIMap from '../Map/Map';

const TabularView = React.lazy(() => import('./TabularView'));
const OptOutPopover = React.lazy(() => import('../CoursePane/OptOutPopover'));
const CoursePane = React.lazy(() => import('../CoursePane/CoursePane'));
const Calendar = React.lazy(() => import('../Calendar/Calendar'));

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
  blueGrey[500],
];

class App extends Component {
  constructor(props) {
    super(props);

    let InstructorEvals = 'eatereval';
    if (typeof Storage !== 'undefined') {
      InstructorEvals = window.localStorage.getItem('InstructorEvals');
      if (InstructorEvals === null) {
        //nothing stored
        InstructorEvals = 'eatereval';
      }
    }

    this.state = {
      prevFormData: null,
      formData: null,
      currentScheduleIndex: 0,
      showSearch: true,
      courseEvents: [],
      unavailableColors: [],
      backupArray: [],
      userID: null,
      rightPaneView: 0,
      finalSchedule: [],
      showFinalSchedule: false,
      activeTab: 0,
      destination: InstructorEvals,
      saved: true,
    };
    this.handleSelectRMP = this.handleSelectRMP.bind(this);
    this.handleSelectEE = this.handleSelectEE.bind(this);
    this.resizeLogo = this.resizeLogo.bind(this);
    this.changeSave = this.changeSave.bind(this);
  }

  componentDidMount = () => {
    document.addEventListener('keydown', this.handleUndo, false);

    ReactGA.initialize('UA-133683751-1');
    ReactGA.pageview('/homepage');

    this.resizeLogo();
    window.addEventListener('resize', this.resizeLogo);
    window.addEventListener('beforeunload', (event) => {
      if (!this.state.saved) {
        //not saved
        event.returnValue = `Are you sure you want to leave?`;
      }
    });
  };

  componentWillUnmount() {
    document.removeEventListener('keydown', this.undoEvent, false);
    window.removeEventListener('resize', this.resizeLogo);
  }

  resizeLogo() {
    this.setState({ isDesktop: window.innerWidth > 960 });
  }

  changeSave(changeTo) {
    //dictates saved or need to save
    //add this.changeSave(false); to functions that change schedules
    //and this.changeSave(true); after saving
    this.setState({ saved: changeTo });
  }

  handleRightPaneViewChange = (event, rightPaneView) => {
    this.setState({ rightPaneView, showSearch: true });
  };

  handleLoad = (userData) => {
    //load schedules
    this.setState({
      currentScheduleIndex: 0,
      courseEvents: userData.courseEvents,
      unavailableColors: userData.unavailableColors,
      backupArray: [],
      saved: true,
    });
  };

  handleSave = async (userID) => {
    //save the schedules
    this.changeSave(true); //marks as saved
    const eventsToSave = [];
    const map = new Map();

    this.state.courseEvents.forEach((event) => {
      if (
        event.isCustomEvent ||
        (!event.isCustomEvent &&
          (!map.has(event.courseCode) ||
            map.get(event.courseCode) !== event.scheduleIndex))
      ) {
        if (event.isCustomEvent) {
          eventsToSave.push(event);
        } else {
          map.set(event.courseCode, event.scheduleIndex);

          eventsToSave.push({
            color: event.color,
            courseCode: event.courseCode,
            courseTerm: event.courseTerm,
            scheduleIndex: event.scheduleIndex,
            isCustomEvent: false,
          });
        }
      }
    });

    await saveUserData(userID, {
      courseEvents: eventsToSave,
      unavailableColors: this.state.unavailableColors,
    });

    this.setState({ userID: userID });
  };

  handleUndo = (event) => {
    if (
      this.state.backupArray.length > 0 &&
      (event == null ||
        (event.keyCode === 90 && (event.ctrlKey || event.metaKey)))
    ) {
      if (this.state.backupArray.length > 0) {
        this.changeSave(false); //marks as need saving

        const lastDeletedEvent = this.state.backupArray[
          this.state.backupArray.length - 1
        ];

        if (lastDeletedEvent.isCustomEvent) {
          this.setState(
            {
              currentScheduleIndex:
                lastDeletedEvent.scheduleIndex === 4
                  ? 3
                  : lastDeletedEvent.scheduleIndex,
              backupArray: this.state.backupArray.slice(
                this.state.backupArray.length - 1,
                this.state.backupArray.length
              ),
            },
            () => {
              this.handleAddCustomEvent(lastDeletedEvent);
            }
          );
        } else {
          this.setState(
            {
              currentScheduleIndex:
                lastDeletedEvent.scheduleIndex === 4
                  ? 3
                  : lastDeletedEvent.scheduleIndex,
              backupArray: this.state.backupArray.slice(
                0,
                this.state.backupArray.length - 1
              ),
            },
            () => {
              this.handleAddClass(
                lastDeletedEvent.section,
                lastDeletedEvent,
                lastDeletedEvent.scheduleIndex,
                lastDeletedEvent.courseTerm
              );
            }
          );
        }
      }
    }
  };

  handleClassDelete = (deletedEvent) => {
    //Delete classes
    //TODO: Pretty much need to rewrite this actually
    this.changeSave(false); //marks as need saving
    const eventsAfterRemovingItem = [];
    const newBackupArray = [];

    this.state.courseEvents.forEach((eventInArray) => {
      if (
        eventInArray.isCustomEvent &&
        deletedEvent.isCustomEvent &&
        deletedEvent.customEventID === eventInArray.customEventID &&
        deletedEvent.scheduleIndex === eventInArray.scheduleIndex
      ) {
        if (
          deletedEvent.scheduleIndex === 4 &&
          !eventsAfterRemovingItem.includes(eventInArray)
        ) {
          const scheduleIndicesToAddTo = [0, 1, 2, 3].filter(
            (index) => index !== this.state.currentScheduleIndex
          );
          eventsAfterRemovingItem.push(
            Object.assign({}, eventInArray, {
              scheduleIndex: scheduleIndicesToAddTo[0],
            })
          );
          eventsAfterRemovingItem.push(
            Object.assign({}, eventInArray, {
              scheduleIndex: scheduleIndicesToAddTo[1],
            })
          );
          eventsAfterRemovingItem.push(
            Object.assign({}, eventInArray, {
              scheduleIndex: scheduleIndicesToAddTo[2],
            })
          );
          newBackupArray.push({
            ...deletedEvent,
            scheduleIndex: this.state.currentScheduleIndex,
          });
        } else {
          newBackupArray.push(deletedEvent);
        }
      } else if (
        !eventInArray.isCustomEvent &&
        !eventInArray.isCustomEvent &&
        deletedEvent.courseCode === eventInArray.courseCode &&
        deletedEvent.scheduleIndex === eventInArray.scheduleIndex
      ) {
        if (
          deletedEvent.scheduleIndex === 4 &&
          !eventsAfterRemovingItem.includes(eventInArray)
        ) {
          const scheduleIndicesToAddTo = [0, 1, 2, 3].filter(
            (index) => index !== this.state.currentScheduleIndex
          );
          eventsAfterRemovingItem.push(
            Object.assign({}, eventInArray, {
              scheduleIndex: scheduleIndicesToAddTo[0],
            })
          );
          eventsAfterRemovingItem.push(
            Object.assign({}, eventInArray, {
              scheduleIndex: scheduleIndicesToAddTo[1],
            })
          );
          eventsAfterRemovingItem.push(
            Object.assign({}, eventInArray, {
              scheduleIndex: scheduleIndicesToAddTo[2],
            })
          );
          newBackupArray.push({
            ...deletedEvent,
            scheduleIndex: this.state.currentScheduleIndex,
          });
        } else {
          newBackupArray.push(deletedEvent);
        }
        const addBackColor = this.state.unavailableColors.filter(
          (colorAndScheduleIndex) => {
            return !(
              colorAndScheduleIndex.color === deletedEvent.color &&
              colorAndScheduleIndex.scheduleIndex ===
                this.state.currentScheduleIndex
            );
          }
        );
        this.setState({ unavailableColors: addBackColor });
      } else {
        eventsAfterRemovingItem.push(eventInArray);
      }
    });

    this.setState({
      courseEvents: eventsAfterRemovingItem,
      backupArray: this.state.backupArray.concat(newBackupArray),
    });
  };

  handleTabChange = (event, value) => {
    this.setState({ activeTab: value });
  };

  handleAddClass = (section, courseDetails, scheduleIndex, courseTerm) => {
    this.changeSave(false); //marks as need saving
    const randomColor = arrayOfColors.find((color) => {
      let isAvailableColor = true;
      this.state.unavailableColors.forEach((colorAndScheduleIndex) => {
        if (
          colorAndScheduleIndex.color === color &&
          (colorAndScheduleIndex.scheduleIndex === scheduleIndex ||
            scheduleIndex === 4)
        ) {
          isAvailableColor = false;
          return;
        }
      });
      return isAvailableColor;
    });

    const doesExist = this.state.courseEvents.find(
      (course) =>
        course.courseCode === section.classCode &&
        (course.scheduleIndex === scheduleIndex || scheduleIndex === 4)
    );

    if (doesExist === undefined) {
      if (scheduleIndex === 4)
        this.setState({
          unavailableColors: this.state.unavailableColors.concat([
            { color: randomColor, scheduleIndex: 0 },
            { color: randomColor, scheduleIndex: 1 },
            { color: randomColor, scheduleIndex: 2 },
            { color: randomColor, scheduleIndex: 3 },
          ]),
        });
      else {
        this.setState({
          unavailableColors: this.state.unavailableColors.concat({
            color: randomColor,
            scheduleIndex: scheduleIndex,
          }),
        });
      }

      let newCourses = []; //added sections; array for multiple times

      section.meetings.forEach((meeting) => {
        const timeString = meeting[0].replace(/\s/g, '');

        if (timeString !== 'TBA') {
          let [, dates, start, startMin, end, endMin, ampm] = timeString.match(
            /([A-za-z]+)(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/
          );

          start = parseInt(start, 10);
          startMin = parseInt(startMin, 10);
          end = parseInt(end, 10);
          endMin = parseInt(endMin, 10);
          dates = [
            dates.includes('M'),
            dates.includes('Tu'),
            dates.includes('W'),
            dates.includes('Th'),
            dates.includes('F'),
          ];

          if (ampm === 'p' && end !== 12) {
            start += 12;
            end += 12;
            if (start > end) start -= 12;
          }

          if (scheduleIndex === 4) {
            for (let i = 0; i < 4; ++i) {
              dates.forEach((shouldBeInCal, index) => {
                if (shouldBeInCal) {
                  const newCourse = {
                    name: courseDetails.name,
                    color: randomColor,
                    courseTerm: courseTerm,
                    title: courseDetails.name[0] + ' ' + courseDetails.name[1],
                    location: meeting[1],
                    section: section,
                    courseCode: section.classCode,
                    courseType: section.classType,
                    start: new Date(2018, 0, index + 1, start, startMin),
                    end: new Date(2018, 0, index + 1, end, endMin),
                    isCustomEvent: false,
                    scheduleIndex: i,
                    prerequisiteLink: courseDetails.prerequisiteLink,
                  };

                  newCourses.push(newCourse);
                }
              });
            }
          } else {
            dates.forEach((shouldBeInCal, index) => {
              if (shouldBeInCal) {
                const newCourse = {
                  name: courseDetails.name,
                  color: randomColor,
                  courseTerm: courseTerm,
                  title: courseDetails.name[0] + ' ' + courseDetails.name[1],
                  location: meeting[1],
                  section: section,
                  courseCode: section.classCode,
                  courseType: section.classType,
                  start: new Date(2018, 0, index + 1, start, startMin),
                  end: new Date(2018, 0, index + 1, end, endMin),
                  isCustomEvent: false,
                  scheduleIndex: scheduleIndex,
                };

                newCourses.push(newCourse);
              }
            });
          }
        } else {
          //tba or online section
          const newCourse = {
            name: courseDetails.name,
            // color: randomColor,
            courseTerm: courseTerm,
            title: courseDetails.name[0] + ' ' + courseDetails.name[1],
            location: meeting[1],
            section: section,
            courseCode: section.classCode,
            courseType: section.classType,
            start: 'tba',
            end: 'tba',
            isCustomEvent: false,
            scheduleIndex: scheduleIndex,
          };

          newCourses.push(newCourse);
        }
      });

      this.setState({
        courseEvents: this.state.courseEvents.concat(newCourses),
      });
    }
  };

  handleScheduleChange = (direction) => {
    //Go through the different schedules
    if (direction === 0) {
      this.setState({
        showFinalSchedule: false,
        currentScheduleIndex: (this.state.currentScheduleIndex - 1 + 4) % 4,
      });
    } else if (direction === 1) {
      this.setState({
        showFinalSchedule: false,
        currentScheduleIndex: (this.state.currentScheduleIndex + 1) % 4,
      });
    }
  };

  handleCopySchedule = (moveTo) => {
    this.changeSave(false); //marks as unsaved data
    let allSchedules = [0, 1, 2, 3];
    let schedulesToMoveTo = [];
    //if move to all schedules
    if (moveTo === 4) {
      allSchedules.forEach((schedule) => {
        if (schedule !== this.state.currentScheduleIndex) {
          schedulesToMoveTo.push(schedule);
        }
      });
    } else {
      schedulesToMoveTo.push(moveTo);
    }

    // for each schedule index to add to
    let newCourses = [];
    schedulesToMoveTo.forEach((schedule) => {
      newCourses = newCourses.concat(this.getClassesAfterCopyingTo(schedule));
      this.setState({
        courseEvents: this.state.courseEvents.concat(newCourses),
      });
    });
  };

  getClassesAfterCopyingTo = (moveTo) => {
    let moveFrom = this.state.currentScheduleIndex;
    const oldClasses = this.state.courseEvents.filter(
      (courseEvent) => courseEvent.scheduleIndex === moveFrom
    );
    let newCourses = [];
    oldClasses.forEach((oldClass) => {
      let newClass = Object.assign({}, oldClass);
      newClass.scheduleIndex = moveTo;
      newCourses.push(newClass);
    });
    return newCourses;
  };

  handleDismissSearchResults = () => {
    this.setState({ showSearch: true, formData: null });
  };

  updateFormData = (formData) => {
    this.setState({ showSearch: false }, function() {
      this.setState({ formData: formData, prevFormData: formData });
    });
  };

  handleAddCustomEvent = (events) => {
    this.setState({ courseEvents: this.state.courseEvents.concat(events) });
    this.changeSave(false); //marks as need saving
  };

  handleEditCustomEvent = (newEvents, oldEvent) => {
    this.changeSave(false); //marks as unsaved data
    let newCourseEvents = this.state.courseEvents.filter(
      (courseEvent) =>
        !courseEvent.isCustomEvent ||
        courseEvent.customEventID !== oldEvent.customEventID ||
        courseEvent.scheduleIndex !== oldEvent.scheduleIndex
    );
    this.setState({ courseEvents: newCourseEvents.concat(newEvents) });
  };

  handleColorChange = (course, color) => {
    //changes color of a course
    this.changeSave(false); //marks as unsaved data
    let courses = this.state.courseEvents;

    if (
      undefined ===
      this.state.unavailableColors.find(function(element) {
        return (
          element.color === color &&
          element.scheduleIndex === course.scheduleIndex
        );
      })
    ) {
      for (let item of courses) {
        if (course.isCustomEvent) {
          if (
            item.scheduleIndex === course.scheduleIndex &&
            item.customEventID === course.customEventID
          )
            item.color = color;
        } else if (
          item.scheduleIndex === course.scheduleIndex &&
          item.courseCode === course.courseCode &&
          item.courseTerm === course.courseTerm
        )
          item.color = color;
      }
      this.setState({
        courseEvents: courses,
        unavailableColors: this.state.unavailableColors.concat({
          color: color,
          scheduleIndex: course.scheduleIndex,
        }),
      });
    }
  };

  displayFinal = (schedule) => {
    //change to finals view
    this.setState(
      {
        showFinalSchedule: !this.state.showFinalSchedule,
      },
      () => {
        if (this.state.showFinalSchedule) {
          this.setState({ finalSchedule: schedule });
        }
      }
    );
  };

  handleSelectRMP = () => {
    ReactGA.event({
      category: 'ProffRating_OPTION',
      action: 'setting_rmp',
      label: 'bad students',
    });
    this.setState({
      destination: 'rmp',
    });
    window.localStorage.setItem('InstructorEvals', 'rmp');
  };

  handleSelectEE = () => {
    ReactGA.event({
      category: 'ProffRating_OPTION',
      action: 'setting_eaterval',
      label: 'good students',
    });
    this.setState({
      destination: 'eatereval',
    });
    window.localStorage.setItem('InstructorEvals', 'eatereval');
  };

  handleClearSchedule = (toDelete) => {
    //Clears schedules
    this.changeSave(false); //marks as unsaved data
    const eventsThatAreDeleted = this.state.courseEvents.filter(
      (courseEvent) => !toDelete.includes(courseEvent.scheduleIndex)
    );
    this.setState({ courseEvents: eventsThatAreDeleted });
  };

  render() {
    return (
      <Fragment>
        <CssBaseline />
        <AppBar
          position="static"
          style={{
            marginBottom: '4px',
            boxShadow: 'none',
            backgroundColor: '#305db7',
          }}
        >
          <Toolbar variant="dense">
            <div style={{ flexGrow: 1 }}>
              {this.state.isDesktop ? (
                <img
                  src={Logo_wide}
                  height={36}
                  alt={'logo'}
                  style={{ marginTop: 5 }}
                />
              ) : (
                <img
                  src={Logo_tight}
                  height={36}
                  alt={'logo'}
                  style={{ marginTop: 5 }}
                />
              )}
            </div>

            <LoadSaveScheduleFunctionality
              onLoad={this.handleLoad}
              onSave={this.handleSave}
              isDesktop={this.state.isDesktop}
            />
            {/* Send current user data to Popover to update currently selected website options */}
            <Suspense fallback={<CircularProgress />}>
              <OptOutPopover
                handleSelectRMP={this.handleSelectRMP}
                handleSelectEE={this.handleSelectEE}
                destination={this.state.destination}
                isDesktop={this.state.isDesktop}
              />
            </Suspense>

            {this.state.isDesktop ? (
              <Tooltip title="Give Us Feedback!">
                <Button
                  onClick={() => {
                    window.open(
                      'https://goo.gl/forms/eIHy4kp56pZKP9fK2',
                      '_blank'
                    );
                  }}
                  color="inherit"
                >
                  <Assignment />
                  <Typography color="inherit">&nbsp;&nbsp;Feedback</Typography>
                </Button>
              </Tooltip>
            ) : (
              <Fragment />
            )}
            {/*empty div to prevent icon bug */}
            <div />
            <Tooltip title="Info Page">
              <Button
                onClick={() => {
                  window.open(
                    'https://www.ics.uci.edu/~rang1/AntAlmanac/index.html',
                    '_blank'
                  );
                }}
                color="inherit"
              >
                <Info />
                {this.state.isDesktop ? (
                  <Typography color="inherit">&nbsp;&nbsp;About</Typography>
                ) : (
                  <Fragment />
                )}
              </Button>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Grid container>
          <Grid item xs={12} s={6} md={6} lg={6} xl={6}>
            <div
              style={{
                display:
                  this.state.activeTab === 0 || this.state.isDesktop
                    ? 'block'
                    : 'none',
              }}
            >
              <Suspense
                fallback={
                  <CircularProgress
                    style={{
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                  />
                }
              >
                <Calendar
                  classEventsInCalendar={
                    this.state.showFinalSchedule
                      ? this.state.finalSchedule
                      : this.state.courseEvents.filter(
                          (courseEvent) =>
                            courseEvent.scheduleIndex ===
                              this.state.currentScheduleIndex ||
                            courseEvent.scheduleIndex === 4
                        )
                  }
                  eventsInCalendar={this.state.courseEvents.filter(
                    (courseEvent) =>
                      courseEvent.scheduleIndex ===
                        this.state.currentScheduleIndex ||
                      courseEvent.scheduleIndex === 4
                  )}
                  showFinalSchedule={this.state.showFinalSchedule}
                  displayFinal={this.displayFinal}
                  isDesktop={this.state.isDesktop}
                  currentScheduleIndex={this.state.currentScheduleIndex}
                  onUndo={this.handleUndo}
                  onCopySchedule={this.handleCopySchedule}
                  onColorChange={this.handleColorChange}
                  onClassDelete={this.handleClassDelete}
                  onScheduleChange={this.handleScheduleChange}
                  onAddCustomEvent={this.handleAddCustomEvent}
                  onEditCustomEvent={this.handleEditCustomEvent}
                  handleClearSchedule={this.handleClearSchedule}
                />
              </Suspense>
            </div>
          </Grid>

          <Grid item xs={12} s={6} md={6} lg={6} xl={6}>
            <div
              style={{
                display:
                  this.state.activeTab === 1 || this.state.isDesktop
                    ? 'block'
                    : 'none',
              }}
            >
              <div
                style={{
                  overflow: 'hidden',
                  marginBottom: '4px',
                  marginRight: '4px',
                  backgroundColor: '#dfe2e5',
                }}
              >
                <Tabs
                  value={this.state.rightPaneView}
                  onChange={this.handleRightPaneViewChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  centered
                >
                  <Tab
                    label={
                      this.state.isDesktop ? (
                        <div style={{ display: 'inline-flex' }}>
                          <Search style={{ height: 18 }} />
                          <Typography>&nbsp;&nbsp;Class Search</Typography>
                        </div>
                      ) : (
                        <Typography>Search</Typography>
                      )
                    }
                  />
                  <Tab
                    label={
                      this.state.isDesktop ? (
                        <div style={{ display: 'inline-flex' }}>
                          <FormatListBulleted style={{ height: 18 }} />
                          <Typography>&nbsp;&nbsp;Added Classes</Typography>
                        </div>
                      ) : (
                        <Typography>Bag</Typography>
                      )
                    }
                  />
                  <Tab
                    label={
                      this.state.isDesktop ? (
                        <div style={{ display: 'inline-flex' }}>
                          <Map style={{ height: 18 }} />
                          <Typography>&nbsp;&nbsp;Dora Mode</Typography>
                        </div>
                      ) : (
                        <Typography>Dora</Typography>
                      )
                    }
                  />
                </Tabs>
              </div>
              <div
                style={{
                  overflow: 'auto',
                  padding: 10,
                  height: `calc(100vh - 96px - 12px - ${
                    this.state.isDesktop ? '0px' : '48px'
                  })`,
                  marginRight: 4,
                  boxShadow: 'none',
                }}
                id="rightPane"
              >
                {this.state.rightPaneView === 1 ? (
                  <Suspense
                    fallback={
                      <CircularProgress
                        style={{
                          height: '100%',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: 'white',
                        }}
                      />
                    }
                  >
                    <TabularView
                      eventsInCalendar={this.state.courseEvents.filter(
                        (courseEvent) =>
                          courseEvent.scheduleIndex ===
                            this.state.currentScheduleIndex ||
                          courseEvent.scheduleIndex === 4
                      )}
                      onColorChange={this.handleColorChange}
                      scheduleIndex={this.state.currentScheduleIndex}
                      onCopySchedule={this.handleCopySchedule}
                      onEditCustomEvent={this.handleEditCustomEvent}
                      onClassDelete={this.handleClassDelete}
                      destination={this.state.destination}
                      handleClearSchedule={this.handleClearSchedule}
                    />
                  </Suspense>
                ) : this.state.rightPaneView === 2 ? (
                  <UCIMap
                    eventsInCalendar={this.state.courseEvents}
                    currentScheduleIndex={this.state.currentScheduleIndex}
                  />
                ) : this.state.showSearch ? (
                  <SearchForm
                    prevFormData={this.state.prevFormData}
                    updateFormData={this.updateFormData}
                  />
                ) : (
                  <Suspense
                    fallback={
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
                    }
                  >
                    <CoursePane
                      formData={this.state.formData}
                      onAddClass={this.handleAddClass}
                      onDismissSearchResults={this.handleDismissSearchResults}
                      currentScheduleIndex={this.state.currentScheduleIndex}
                      term={this.state.formData}
                      destination={this.state.destination}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </Grid>

          <Hidden mdUp>
            <Grid item xs={12}>
              <div>
                <Tabs
                  value={this.state.activeTab}
                  onChange={this.handleTabChange}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab icon={<CalendarToday />} />
                  <Tab icon={<Search />} />
                </Tabs>
              </div>
            </Grid>
          </Hidden>
        </Grid>
      </Fragment>
    );
  }
}

export default App;
