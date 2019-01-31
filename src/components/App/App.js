import React, {Component} from "react";
import {Fragment} from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
    Grid,
    Toolbar,
    AppBar,
    Paper,
    Tooltip
} from "@material-ui/core";

import SearchForm from "../SearchForm/SearchForm";
import CoursePane from "../CoursePane/CoursePane";
import Calendar from "../Calendar/Calendar";
import {ListAlt, Dns} from "@material-ui/icons";
import Info from "@material-ui/icons/InfoSharp";
import LoadUser from "../cacheMes/cacheM";

import {
    convertToCalendar,
    saveUserDB,
    getCustomDate,
    helpDelete,
    helpAdd
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
import IconButton from "@material-ui/core/IconButton/IconButton";

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
            prevFormData: null,
            currentScheduleIndex: 0,
            view: 0,
            showMore: false,
            showSearch: true,
            courseEvents: [],
            unavailableColors: [], //{{color: '#FFFFFF', scheduleIndex: 1}

            backupArray: [],
            chat: false,
        };
    }

    componentDidMount = () => {
        document.addEventListener("keydown", this.undoEvent, false);
    };

    componentWillUnmount() {
        document.removeEventListener("keydown", this.undoEvent, false);
    }

    setView = viewNum => {
        if (this.state.formData != null) this.setState({view: viewNum});
    };

    handleLoad = userData => {
        this.setState({
            schedule0Events: userData.calEvents[0],
            schedule1Events: userData.calEvents[1],
            schedule2Events: userData.calEvents[2],
            schedule3Events: userData.calEvents[3],
            customEvents: userData.customE,
            coursesEvents: userData.normalE,
            cusID: userData.ID,
            backupArray: [],
            currentScheduleIndex: 0
        });
    };

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

    undoEvent = event => {
        if (
            this.state.backupArray.length > 0 &&
            (event.keyCode === 90 && (event.ctrlKey || event.metaKey))
        ) {
            this.undoEventHelp();
        }
    };

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

    handleClassDelete = (event) => {
        const eventsAfterRemovingItem = [];

        this.state.courseEvents.forEach(eventInArray =>  {
            if (eventInArray.isCustomEvent && event.isCustomEvent
                && event.customEventID === eventInArray.customEventID
                && event.scheduleIndex === eventInArray.scheduleIndex) {

                if (event.scheduleIndex === 4 && !eventsAfterRemovingItem.includes(eventInArray)) {
                    const scheduleIndicesToAddTo = [0, 1, 2, 3].filter(index => index !== this.state.currentScheduleIndex);
                    eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[0]}));
                    eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[1]}));
                    eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[2]}));
                }
            } else if (!eventInArray.isCustomEvent && !eventInArray.isCustomEvent
                && event.courseCode === eventInArray.courseCode
                && event.scheduleIndex === eventInArray.scheduleIndex) {

                if (event.scheduleIndex === 4 && !eventsAfterRemovingItem.includes(eventInArray)) {
                    const scheduleIndicesToAddTo = [0, 1, 2, 3].filter(index => index !== this.state.currentScheduleIndex);
                    eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[0]}));
                    eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[1]}));
                    eventsAfterRemovingItem.push(Object.assign({}, eventInArray, {scheduleIndex: scheduleIndicesToAddTo[2]}));
                }
                const addBackColor = this.state.unavailableColors.filter(colorAndScheduleIndex => {
                    return !(colorAndScheduleIndex.color === event.color && event.scheduleIndex === 4 ?
                        colorAndScheduleIndex.scheduleIndex === this.state.currentScheduleIndex :
                        colorAndScheduleIndex.scheduleIndex === event.scheduleIndex)
                });
                this.setState({unavailableColors: addBackColor});
            } else {
                eventsAfterRemovingItem.push(eventInArray);
            }
        });
        this.setState({courseEvents: eventsAfterRemovingItem});
    };

    handleAddClass = (section, name, scheduleIndex, termName) => {
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

        if (!doesExist) {
            if (scheduleIndex === 4)
                this.setState({unavailableColors: this.state.unavailableColors.concat([
                    {color: randomColor, scheduleIndex: 0},
                    {color: randomColor, scheduleIndex: 1},
                    {color: randomColor, scheduleIndex: 2},
                    {color: randomColor, scheduleIndex: 3},
                    ])});
            else
                this.setState({unavailableColors: this.state.unavailableColors.concat({color: randomColor, scheduleIndex: scheduleIndex})});

            let newCourses = [];

            section.meetings.forEach(meeting => {
                const timeString = meeting[0].replace(/\s/g, "");

                if (timeString !== 'TBA') {

                    let [_, dates, start, startMin, end, endMin, ampm] = timeString.match(/([A-za-z]+)(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})(p?)/);

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

                    dates.forEach((shouldBeInCal, index) => {
                        if (shouldBeInCal) {
                            const newCourse = {
                                color: randomColor,
                                courseTerm: termName,
                                title: name[0] + ' ' + name[1],
                                location: meeting[1],
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
            });

            this.setState({courseEvents: this.state.courseEvents.concat(newCourses)});
        }
    };

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

    handleDismissSearchResults = () => {
        this.setState({showSearch: true});
    };

    updateFormData = formData => {
        this.setState({showMore: false, showSearch: false}, function () {
            this.setState({formData: formData, prevFormData: formData});
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
                courseEvents: [],
                unavailableColors: [], //{{color: '#FFFFFF', scheduleIndex: 1}
            });
        }
    };

    moreInfoF = () => {
        this.setState({showMore: !this.state.showMore}, function () {
            if (this.state.showMore === true) this.setState({formData: null});
            else this.setState({formData: this.state.prevFormData});
        });
    };

    render() {
        return (
            <Fragment>

                <CssBaseline/>
                <AppBar position='static' style={{marginBottom: '8px'}}>
                    <Toolbar variant="dense">
                        <div>
                            {/*{this.state.isDesktop ? (*/}
                                {/*<img*/}
                                    {/*src={logo_wide}*/}
                                    {/*style={{height: 35, width: 394}}*/}
                                    {/*alt="XD"*/}
                                {/*/>*/}
                            {/*) : (*/}
                                {/*<img*/}
                                    {/*src={logo_tight}*/}
                                    {/*style={{height: 45, width: 202}}*/}
                                    {/*alt=":("*/}
                                {/*/>*/}
                            {/*)}*/}
                        </div>
                        {/*<LoadUser load={this.handleLoad} save={this.handleSave}/>*/}

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
                                classEventsInCalendar={
                                    this.state.courseEvents.filter(courseEvent => (courseEvent.scheduleIndex === this.state.currentScheduleIndex || courseEvent.scheduleIndex === 4))
                                }
                                moreInfoF={this.moreInfoF}
                                clickToUndo={this.undoEventHelp}
                                currentScheduleIndex={this.state.currentScheduleIndex}
                                onClassDelete={this.handleClassDelete}
                                onScheduleChange={this.handleScheduleChange}
                                onAddCustomEvent={this.handleAddCustomEvent}
                                setID={this.setID}
                                onClearSchedule={this.handleClearSchedule}
                            />
                        </div>
                    </Grid>

                    <Grid item lg={6} xs={12}>
                        <Paper  elevation={0} style={{overflow: "hidden",  marginBottom: '8px'}}>
                            <Toolbar variant="dense" style={{backgroundColor: "#5191d6"}}>
                                <Tooltip title="List View">
                                    <IconButton onClick={() => this.setView(0)}>
                                        <ListAlt/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Tile View">
                                    <IconButton onClick={() => this.setView(1)}>
                                        <Dns/>
                                    </IconButton>
                                </Tooltip>
                            </Toolbar>
                        </Paper>
                        <Paper
                            style={{
                                overflow: "auto",
                                padding: 10,
                                height: 'calc(100vh - 96px - 24px)'
                            }}
                            id='foo1'
                        >
                            {this.state.showSearch ? <SearchForm updateFormData={this.updateFormData} /> :
                                <CoursePane
                                    view={this.state.view}
                                    formData={this.state.formData}
                                    onAddClass={this.handleAddClass}
                                    onDismissSearchResults={this.handleDismissSearchResults}
                                    term={this.state.formData}
                                    showMore={this.state.showMore}
                                    coursesEvents={this.state.coursesEvents}/>}
                        </Paper>
                    </Grid>
                </Grid>
            </Fragment>
        );
    }
}

export default App;