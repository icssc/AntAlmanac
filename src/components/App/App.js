import React, {Component} from "react";
import {Fragment} from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import {
    Grid,
    Toolbar,
    Typography,
    AppBar,
    Paper,
    Tooltip
} from "@material-ui/core";

import MessengerCustomerChat from "react-messenger-customer-chat";
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
            view: 0,
            chat: false,
            showMore: false,
            isDesktop: false,
            showSearch: true
        };

        this.resizeLogo = this.resizeLogo.bind(this);
    }

    componentDidMount = () => {
        document.addEventListener("keydown", this.undoEvent, false);
        window.addEventListener("resize", this.resizeLogo);
    };

    componentWillUnmount() {
        document.removeEventListener("keydown", this.undoEvent, false);
        window.removeEventListener("resize", this.resizeLogo);
    }

    resizeLogo() {
        this.setState({isDesktop: window.innerWidth > 1000});
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

    handleClassDelete = (courseID, courseTerm, isCustom) => {
        var arrayE = [];
        var backup = this.state.backupArray;

        var currentScheduleIndex = this.state.currentScheduleIndex;

        if (isCustom) arrayE = this.state.customEvents;
        else arrayE = this.state.coursesEvents;

        backup = helpDelete(
            courseID,
            courseTerm,
            isCustom,
            arrayE,
            backup,
            currentScheduleIndex
        );

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
            function () {
                if (isCustom) this.setState({customEvents: arrayE});
                else this.setState({coursesEvents: arrayE});
            }
        );
    };

    handleAddClass = (section, name, scheduleNumber, termName) => {
        if (scheduleNumber === 4) {
            this.handleAddClass(section, name, 0, termName);
            this.handleAddClass(section, name, 1, termName);
            this.handleAddClass(section, name, 2, termName);
            this.handleAddClass(section, name, 3, termName);
            return;
        }
        const arrayE = this.state.coursesEvents;

        const eventData = helpAdd(arrayE, section, name, scheduleNumber, termName);

        if (eventData.allowToAdd) {
            let cal = [];
            section.meetings.forEach(meeting => {
                const timeString = meeting[0].replace(/\s/g, "");
                const newClasses = convertToCalendar(
                    section,
                    timeString,
                    eventData.randomColor,
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
        } else this.setState({coursesEvents: arrayE});
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

    handleAddCustomEvent = (events, calendarIndex, dates) => {
        var arrayE = this.state.customEvents;
        var foundIndex = arrayE.findIndex(function (element) {
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

    //get id for the custom event
    setID = () => {
        const id = this.state.cusID + 1;
        this.setState({cusID: id});
        return id;
    };

    handleClearSchedule = () => {
        if (
            window.confirm(
                "Are you sure you want to clear all the schedules? (you can still recover the schedules by loading from the database)"
            )
        ) {
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
                <div>
                    <MessengerCustomerChat
                        pageId="2286387408050026"
                        appId="343457496213889"
                    />
                </div>
                <CssBaseline/>
                <AppBar id="fox" position='static' style={{marginBottom: '8px'}}>
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

                        <Typography
                            variant="title"
                            id="introID"
                            color="inherit"
                            style={{flexGrow: 2}}
                        />
                        <LoadUser load={this.handleLoad} save={this.handleSave}/>

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
                                    this.state[
                                    "schedule" + this.state.currentScheduleIndex + "Events"
                                        ]
                                }
                                heighSize={this.state.hS}
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