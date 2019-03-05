import React, {Component} from "react";
import {Fragment} from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
  Grid,
  Toolbar,
  AppBar,
  Paper,
  Tooltip,
  Typography,
  IconButton,
  Button
} from "@material-ui/core";
import Logo_tight from './logo_tight.png';
import Logo_wide from './logo_wide.png';

import SearchForm from "../SearchForm/SearchForm";
import CoursePane from "../CoursePane/CoursePane";
import Calendar from "../Calendar/Calendar";
import {
  Info,
  ListAlt,
  Dns,
  ImportContacts,
  FormatListBulleted,
  Search,
  Assignment
} from "@material-ui/icons";
import LoadSaveScheduleFunctionality from "../cacheMes/LoadSaveFunctionality";

import {
  saveUserData,
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
} from '@material-ui/core/colors';
import TabularView from './TabularView';

const arrayOfColors = [red[500], pink[500],
  purple[500], indigo[500],
  deepPurple[500], blue[500],
  green[500], cyan[500],
  teal[500], lightGreen[500],
  lime[500], amber[500],
  blueGrey[500]];

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formData: null,
      currentScheduleIndex: 0,
      view: 0,
      showSearch: true,
      courseEvents: [],
      unavailableColors: [],
      backupArray: [],
      userID: null,
      showTabularView: false,
      finalSchedule:[],
      showFinalSchedule:false
    };

    this.resizeLogo = this.resizeLogo.bind(this);
  }

  componentDidMount = () => {
    document.addEventListener("keydown", this.handleUndo, false);

    this.resizeLogo();
    window.addEventListener("resize", this.resizeLogo);
  };

  componentWillUnmount() {
    document.removeEventListener("keydown", this.undoEvent, false);
    window.removeEventListener("resize", this.resizeLogo);
  }

  resizeLogo() {
    this.setState({ isDesktop: window.innerWidth > 1000 });
  }

  handleToggleShowTabularView = () => {
      this.setState(previousState => ({showTabularView: !previousState.showTabularView}),()=>{
        if(!this.state.showTabularView)
        this.setState({showFinalSchedule:false})
      }
      );
      this.handleDismissSearchResults();
  };

  setView = viewNum => {
    if (this.state.showSearch === false) this.setState({view: viewNum});
  };

  handleLoad = userData => {
    this.setState({
      currentScheduleIndex: 0,
      courseEvents: userData.courseEvents,
      unavailableColors: userData.unavailableColors,
      backupArray: [],
    })
  };

  handleSave = async userID => {
    const eventsToSave = [];
    const map = new Map();

    this.state.courseEvents.forEach((event) => {
      if (event.isCustomEvent || (!event.isCustomEvent && (!map.has(event.courseCode) || (map.get(event.courseCode) !== event.scheduleIndex)))) {
        if (event.isCustomEvent) {
          eventsToSave.push(event);
        } else {
          map.set(event.courseCode, event.scheduleIndex);

          eventsToSave.push({
            color: event.color,
            courseCode: event.courseCode,
            courseTerm: event.courseTerm,
            scheduleIndex: event.scheduleIndex,
            isCustomEvent: false
          });
        }
      }
    });

    await saveUserData(userID, {
      courseEvents: eventsToSave,
      unavailableColors: this.state.unavailableColors,
    });

    this.setState({userID: userID});
  };

  handleUndo = (event) => {
    if (this.state.backupArray.length > 0 && (event == null || (event.keyCode === 90 && (event.ctrlKey || event.metaKey)))) {
      if (this.state.backupArray.length > 0) {
        const lastDeletedEvent = this.state.backupArray[this.state.backupArray.length - 1];

        if (lastDeletedEvent.isCustomEvent) {
          this.setState(
            {
              currentScheduleIndex: lastDeletedEvent.scheduleIndex,
              backupArray: this.state.backupArray.slice(this.state.backupArray.length - 1, this.state.backupArray.length)
            },
            () => {
              this.handleAddCustomEvent(lastDeletedEvent);
            }
          );
        } else {
          this.setState(
            {
              currentScheduleIndex: lastDeletedEvent.scheduleIndex,
              backupArray: this.state.backupArray.slice(0, this.state.backupArray.length - 1)
            },
            () => {
              this.handleAddClass(
                lastDeletedEvent.section,
                lastDeletedEvent.name,
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
    const eventsAfterRemovingItem = [];

    this.state.courseEvents.forEach(eventInArray => {
      if (eventInArray.isCustomEvent && deletedEvent.isCustomEvent
        && deletedEvent.customEventID === eventInArray.customEventID
        && deletedEvent.scheduleIndex === eventInArray.scheduleIndex) {

        if (deletedEvent.scheduleIndex === 4 && !eventsAfterRemovingItem.includes(eventInArray)) {
          const scheduleIndicesToAddTo = [0, 1, 2, 3].filter(index => index !== this.state.currentScheduleIndex);
          eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[0]}));
          eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[1]}));
          eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[2]}));
        }
      } else if (!eventInArray.isCustomEvent && !eventInArray.isCustomEvent
        && deletedEvent.courseCode === eventInArray.courseCode
        && deletedEvent.scheduleIndex === eventInArray.scheduleIndex) {

        if (deletedEvent.scheduleIndex === 4 && !eventsAfterRemovingItem.includes(eventInArray)) {
          const scheduleIndicesToAddTo = [0, 1, 2, 3].filter(index => index !== this.state.currentScheduleIndex);
          eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[0]}));
          eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[1]}));
          eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[2]}));
        }
        const addBackColor = this.state.unavailableColors.filter(colorAndScheduleIndex => {
          return !(colorAndScheduleIndex.color === deletedEvent.color &&
            colorAndScheduleIndex.scheduleIndex === this.state.currentScheduleIndex)
        });
        this.setState({unavailableColors: addBackColor});
      } else {
        eventsAfterRemovingItem.push(eventInArray);
      }
    });

    this.setState({courseEvents: eventsAfterRemovingItem, backupArray: this.state.backupArray.concat(deletedEvent)});
  };

  handleAddClass = (section, name, scheduleIndex, courseTerm) => {
    //TODO: Can we speed up this operation?
    const randomColor = arrayOfColors.find(color => {
      let isAvailableColor = true;
      this.state.unavailableColors.forEach(colorAndScheduleIndex => {
        if (colorAndScheduleIndex.color === color && (colorAndScheduleIndex.scheduleIndex === scheduleIndex || scheduleIndex === 4)) {
          isAvailableColor = false;
          return;
        }
      });
      return isAvailableColor;
    });

    const doesExist = this.state.courseEvents.find(course =>
      course.courseCode === section.classCode && (course.scheduleIndex === scheduleIndex || scheduleIndex === 4)
    );

    if (doesExist === undefined) {
      if (scheduleIndex === 4)
        this.setState({
          unavailableColors: this.state.unavailableColors.concat([
            {color: randomColor, scheduleIndex: 0},
            {color: randomColor, scheduleIndex: 1},
            {color: randomColor, scheduleIndex: 2},
            {color: randomColor, scheduleIndex: 3},
          ])
        });
      else
      {
        this.setState({
          unavailableColors: this.state.unavailableColors.concat({
            color: randomColor,
            scheduleIndex: scheduleIndex
          })
        })};

      let newCourses = [];

      section.meetings.forEach(meeting => {
        const timeString = meeting[0].replace(/\s/g, "");

        if (timeString !== 'TBA') {

          let [, dates, start, startMin, end, endMin, ampm] = timeString.match(/([A-za-z]+)(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/);

          start = parseInt(start, 10);
          startMin = parseInt(startMin, 10);
          end = parseInt(end, 10);
          endMin = parseInt(endMin, 10);
          dates = [dates.includes('M'), dates.includes('Tu'), dates.includes('W'), dates.includes('Th'), dates.includes('F')];

          if (ampm === 'p' && end !== 12) {
            start += 12;
            end += 12;
            if (start > end) start -= 12;
          }

          if(scheduleIndex ===4)
          {
          for(let i =0;i<4;++i)
          {
            dates.forEach((shouldBeInCal, index) => {
              if (shouldBeInCal) {
                const newCourse = {
                  name: name,
                  color: randomColor,
                  courseTerm: courseTerm,
                  title: name[0] + ' ' + name[1],
                  location: meeting[1],
                  section: section,
                  courseCode: section.classCode,
                  courseType: section.classType,
                  start: new Date(2018, 0, index + 1, start, startMin),
                  end: new Date(2018, 0, index + 1, end, endMin),
                  isCustomEvent: false,
                  scheduleIndex: i
                };

                newCourses.push(newCourse);
              }
            });
          }
        }
        else
        {
          dates.forEach((shouldBeInCal, index) => {
            if (shouldBeInCal) {
              const newCourse = {
                name: name,
                color: randomColor,
                courseTerm: courseTerm,
                title: name[0] + ' ' + name[1],
                location: meeting[1],
                section: section,
                courseCode: section.classCode,
                courseType: section.classType,
                start: new Date(2018, 0, index + 1, start, startMin),
                end: new Date(2018, 0, index + 1, end, endMin),
                isCustomEvent: false,
                scheduleIndex: scheduleIndex
              };

              newCourses.push(newCourse);
            }
          });
        }
        }
      });

      this.setState({courseEvents: this.state.courseEvents.concat(newCourses)});
    }
  };

  handleScheduleChange = direction => {
    if (direction === 0) {
      this.setState({
        showFinalSchedule:false,  currentScheduleIndex: (this.state.currentScheduleIndex - 1 + 4) % 4
      });
    } else if (direction === 1) {
      this.setState({
        showFinalSchedule:false, currentScheduleIndex: (this.state.currentScheduleIndex + 1) % 4
      });
    }
  };

  handleDismissSearchResults = () => {
    this.setState({showSearch: true});
  };

  updateFormData = formData => {
    this.setState({showSearch: false}, function () {
      this.setState({formData: formData});
    });
  };

  handleAddCustomEvent = (events) => {
    this.setState({courseEvents: this.state.courseEvents.concat(events)});
  };

  handleClearSchedule = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all your schedules?"
      )
    ) {
      this.setState({
        backupArray: this.state.backupArray.concat(this.state.courseEvents),
        courseEvents: [],
        unavailableColors: [],
      });
    }
  };

  colorChange =(course,color)=>
  {
    let courses = this.state.courseEvents;

  if(undefined===this.state.unavailableColors.find(function(element){return element.color === color&&element.scheduleIndex===course.scheduleIndex}))
  {
    for(var item of courses)
    {
      if(item.scheduleIndex===course.scheduleIndex&& item.courseCode===course.courseCode && item.courseTerm===course.courseTerm)
      item.color=color;
    }
    this.setState({courseEvents:courses, unavailableColors: this.state.unavailableColors.concat(
      {color: color, scheduleIndex: course.scheduleIndex})});
  }
}

displayFinal =(schedule)=>
{


  this.setState({
    showFinalSchedule:!this.state.showFinalSchedule},()=>{
      if(this.state.showFinalSchedule)
      {
        console.log("finalc",schedule);
       this.setState({finalSchedule:schedule});
      }
    });

}


  render() {
    return (
      <Fragment>
        <CssBaseline/>
        <AppBar position='static' style={{marginBottom: '8px'}}>
          <Toolbar variant="dense">
            <Typography style={{ flexGrow: 1 }}>
              {this.state.isDesktop ? (
                <img src={Logo_wide} height={36} alt={"logo"} style={{marginTop: 5}}/>
               ) : (
                <img src={Logo_tight} height={36} alt={"logo"} style={{marginTop: 5}}/>
               )}
             </Typography>

            <LoadSaveScheduleFunctionality onLoad={this.handleLoad} onSave={this.handleSave}/>

            <Tooltip title="Blue Book Giveaway!">
              <a
                style={{color: "white"}}
                href={"https://goo.gl/forms/KI6MkNCZsyzIVkF42"}
                target="_blank"
              >
                <ImportContacts style={{marginLeft: 15, marginRight: 30}} fontSize="48px" color="white"/>
              </a>
            </Tooltip>
            <Tooltip title="Give Us Feedback!">
              <a
                style={{color: "white"}}
                href={"https://goo.gl/forms/eIHy4kp56pZKP9fK2"}
                target="_blank"
              >
                <Assignment style={{marginRight: 27, marginTop: 5}} fontSize="48px" color="white"/>
              </a>
            </Tooltip>
            <Tooltip title="Info Page">
              <a
                style={{color: "white"}}
                href={"https://www.ics.uci.edu/~rang1/AntAlmanac/index.html"}
                target="_blank"
              >
                <Info fontSize="48px" color="white"/>
              </a>
            </Tooltip>

          </Toolbar>
        </AppBar>
        <Grid container>
          <Grid item lg={6} xs={12}>
            <div>
              <Calendar
                classEventsInCalendar={this.state.showFinalSchedule?this.state.finalSchedule:
                  this.state.courseEvents.filter(courseEvent => (courseEvent.scheduleIndex === this.state.currentScheduleIndex || courseEvent.scheduleIndex === 4))
                }
                storeFinal={this.storeFinal}
                showFinalSchedul={this.state.showFinalSchedule}
                onUndo={this.handleUndo}
                currentScheduleIndex={this.state.currentScheduleIndex}
                onClassDelete={this.handleClassDelete}
                onScheduleChange={this.handleScheduleChange}
                onAddCustomEvent={this.handleAddCustomEvent}
                setID={this.setID}
                onClearSchedule={this.handleClearSchedule}
                showFinalSchedul={this.showFinalSchedule}
              />
            </div>
          </Grid>

          <Grid item lg={6} xs={12}>
            <Paper elevation={0} style={{overflow: "hidden", marginBottom: '8px'}}>
              <Toolbar variant="dense" style={{backgroundColor: "#5191d6", marginRight:8}}>
                {this.state.view ? (
                  <Tooltip title="List View">
                    <IconButton onClick={() => this.setView(0)}>
                      <ListAlt />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Tile View">
                    <IconButton onClick={() => this.setView(1)}>
                      <Dns />
                    </IconButton>
                  </Tooltip>
                )}

                {!this.state.showTabularView ?(
                  <Tooltip title="Show Tabular View: More Info on Selected Courses">
                    <IconButton onClick={this.handleToggleShowTabularView}>
                        <FormatListBulleted/>
                    </IconButton>
                  </Tooltip>
                ):(
                  <Tooltip title="Show Search View">
                    <IconButton onClick={this.handleToggleShowTabularView}>
                        <Search/>
                    </IconButton>
                  </Tooltip>
                )}

                <Typography style={{flexGrow: 1}}/>

                <Button href="https://www.facebook.com/AntAlmanac/">
                  <Typography>
                    Message Us!
                  </Typography>
                </Button>

              </Toolbar>
            </Paper>
            <Paper
                    style={{
                      overflow: "auto",
                      padding: 10,
                      height: 'calc(100vh - 96px - 24px)',
                      marginRight: 8
                    }}
                    id='rightPane'
                  >
            {this.state.showTabularView ?
              <TabularView showFinalSchedule ={this.state.showFinalSchedule} displayFinal={this.displayFinal} classEventsInCalendar={this.state.courseEvents.filter(courseEvent => (courseEvent.scheduleIndex === this.state.currentScheduleIndex || courseEvent.scheduleIndex === 4))}  colorChange={this.colorChange}/>              :
              (
                  this.state.showSearch ? <SearchForm updateFormData={this.updateFormData}/> :
                    <CoursePane
                      view={this.state.view}
                      formData={this.state.formData}
                      onAddClass={this.handleAddClass}
                      onDismissSearchResults={this.handleDismissSearchResults}
                      term={this.state.formData}/>
              )}
              </Paper>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default App;
