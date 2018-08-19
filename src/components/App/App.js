import React, {Component} from 'react';
import {Fragment} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid';
import SearchForm from "../SearchForm/SearchForm";
import CoursePane from "../CoursePane/CoursePane";
import Calendar from "../Calendar/Calendar";
import Paper from "@material-ui/core/Paper";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";
import LoginBtn from "../LogInButton/LButton";
import Popup from "../CustomEvents/Popup/Popup";

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

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: null,
            classEventsInCalendar: [],
            arrayOfColors: [
                red[500], pink[500],
                purple[500], indigo[500],
                deepPurple[500], blue[500],
                green[500], cyan[500],
                teal[500], lightGreen[500],
                lime[500], amber[500],
                blueGrey[500]]
        };

        this.updateFormData = this.updateFormData.bind(this);
        this.handleAddClass = this.handleAddClass.bind(this);
        this.handleClassDelete = this.handleClassDelete.bind(this);
    }

    handleClassDelete(title) {
        let colorFound = false;

        const classEventsInCalendar = this.state.classEventsInCalendar.filter(
            event => {
                if (!colorFound && event.title === title && event.color !== undefined) {
                    this.setState({arrayOfColors: this.state.arrayOfColors.concat(event.color)});
                    colorFound = true;
                }
                return event.title !== title;
            }
        );
        this.setState({classEventsInCalendar: classEventsInCalendar});
    }

    handleAddClass(section, name) {
        const random_color = this.state.arrayOfColors[Math.floor(Math.random() * this.state.arrayOfColors.length)];

        const checkExist = this.state.classEventsInCalendar.find((element) =>
            element.title === section.classCode + " " + name[0]
        );

        if (!checkExist) {
            this.setState({arrayOfColors: this.state.arrayOfColors.filter(color => color !== random_color)});

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
            this.setState({classEventsInCalendar: this.state.classEventsInCalendar.concat(newClasses)});
        }
    }

    updateFormData(formData) {
        this.setState({formData: formData});
    }

    render() {
        return (
            <Fragment>
                <CssBaseline/>
                {/*temporary placement*/}
                <LoginBtn
                  onName={this.handleName}
                  value={this.state.nName}
                  onSubmit={this.handleSubmit}
                  onPopup={this.handlePopup}
                />
                <Grid container>
                    <Grid item lg={12}>
                        <AlmanacGraphWrapped />
                        {/* temporary placement */}
                        <Popup />
                        <SearchForm updateFormData={this.updateFormData}/>
                    </Grid>
                    <Grid item lg={6} xs={12}>
                        <Paper
                            style={{maxHeight: '90vh', overflow: 'auto', margin: 10}}>
                            <Calendar classEventsInCalendar={this.state.classEventsInCalendar}
                                      onClassDelete={this.handleClassDelete}/>
                        </Paper>
                    </Grid>

                    <Grid item lg={6} xs={12}>
                        <Paper
                            style={{height: '90vh', overflow: 'auto', margin: 10}}>
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
