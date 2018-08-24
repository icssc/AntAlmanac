import React, {Component} from 'react';
import {Fragment} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar';
import SearchForm from "../SearchForm/SearchForm";
import CoursePane from "../CoursePane/CoursePane";
import Calendar from "../Calendar/Calendar";
import Paper from "@material-ui/core/Paper";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";
import Popup from "../CustomEvents/Popup/Popup";
import Button from "@material-ui/core/Button";
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
            schedule0Events: [],
            schedule1Events: [],
            schedule2Events: [],
            schedule3Events: [],
            currentScheduleIndex: 0,
            arrayOfColors0: arrayOfColors.slice(0),
            arrayOfColors1: arrayOfColors.slice(0),
            arrayOfColors2: arrayOfColors.slice(0),
            arrayOfColors3: arrayOfColors.slice(0)
        };

        this.updateFormData = this.updateFormData.bind(this);
        this.handleAddClass = this.handleAddClass.bind(this);
        this.handleClassDelete = this.handleClassDelete.bind(this);
        this.handleScheduleChange = this.handleScheduleChange.bind(this);
    }

    handleClassDelete(title) {
        let colorFound = false;

        const classEventsInCalendar = this.state['schedule' + this.state.currentScheduleIndex + 'Events'].filter(
            event => {
                if (!colorFound && event.title === title && event.color !== undefined) {
                    this.setState({['arrayOfColors' + this.state.currentScheduleIndex]: this.state['arrayOfColors' + this.state.currentScheduleIndex].concat(event.color)});
                    colorFound = true;
                }
                return event.title !== title;
            }
        );
        this.setState({['schedule' + this.state.currentScheduleIndex + 'Events']: classEventsInCalendar});
    }

    handleAddClass(section, name) {
        const arrayOfColorsName = 'arrayOfColors' + this.state.currentScheduleIndex;

        const random_color = this.state[arrayOfColorsName][Math.floor(Math.random() * this.state[arrayOfColorsName].length)];

        const checkExist = this.state['schedule' + this.state.currentScheduleIndex + 'Events'].find((element) =>
            element.title === section.classCode + " " + name[0]
        );

        if (!checkExist) {
            this.setState({[arrayOfColorsName]: this.state[arrayOfColorsName].filter(color => color !== random_color)});

            let newClasses = [];

            section.meetings.forEach(timeString => {
                timeString = timeString[0].replace(/\s/g, "");

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
                            const newClass = {
                                color: random_color,
                                title: section.classCode + " " + name[0],
                                start: new Date(2018, 0, index + 1, start, startMin),
                                end: new Date(2018, 0, index + 1, end, endMin)
                            };
                            newClasses.push(newClass);
                        }
                    });
                }
            });

            this.setState({['schedule' + this.state.currentScheduleIndex + 'Events']: this.state['schedule' + this.state.currentScheduleIndex + 'Events'].concat(newClasses)});
        }
    }

    handleScheduleChange(direction) {
        if (direction === 0) {
            if (this.state.currentScheduleIndex !== 0) {
                this.setState({currentScheduleIndex: this.state.currentScheduleIndex - 1});
            }
        } else if (direction === 1) {
            if (this.state.currentScheduleIndex !== 3) {
                this.setState({currentScheduleIndex: this.state.currentScheduleIndex + 1});
            }
        }
    }

    
    updateFormData(formData) {
        this.setState({formData: formData});
    }

    handleCustemTime(obj)
    {
        this.setState({schedule0Events: this.state.schedule0Events.concat(obj)});
       
    }

    render() {
       

        return (
            <Fragment>
                <CssBaseline/>
                <AppBar>
                    <Toolbar variant='dense'>
                        <Typography variant="title" color="inherit" style={{flexGrow: 1}}>AntAlmanac</Typography>
                        <Button color="inherit">Load Schedule</Button>
                        <Button color="inherit">Save Schedule</Button>
                        <AlmanacGraphWrapped />
                    </Toolbar>
                </AppBar>
                <Grid container>
                    <Grid item lg={12}>
                   
                        <Popup callback={this.handleCustemTime.bind(this)}/>
                        
                        {console.log(this.state,"app->STATE")}
                       
                        <SearchForm updateFormData={this.updateFormData}/>
                    </Grid>
                    <Grid item lg={6} xs={12}>
                        <div style={{margin: '10px 5px 0px 10px'}}>
                            <Calendar classEventsInCalendar={this.state['schedule' + this.state.currentScheduleIndex + 'Events']}
                                      currentScheduleIndex={this.state.currentScheduleIndex}
                                      onClassDelete={this.handleClassDelete}
                                      onScheduleChange={this.handleScheduleChange}/>
                        </div>
                    </Grid>

                    <Grid item lg={6} xs={12}>
                        <Paper
                            style={{height: '85vh', overflow: 'auto', margin: '10px 10px 0px 5px'}}>
                            <CoursePane
                                formData={this.state.formData}
                                handleAddClass={this.handleAddClass}
                            />
                        </Paper>
                    </Grid>
                </Grid></Fragment>
        );
    }
}

export default App;
