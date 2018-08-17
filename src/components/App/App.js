import React, {Component} from 'react';
import {Fragment} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid';
import SearchForm from "../SearchForm/SearchForm";
import CoursePane from "../CoursePane/CoursePane";
import Calendar from "../Calendar/Calendar";
import Paper from "@material-ui/core/Paper";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: null,
            classesInCalendar: [{
                color: '#4a6591',
                start: new Date(2018, 0, 1, 8),
                end: new Date(2018, 0, 1, 8, 50),
                title: "ICS 33"
            }]
        };

        this.updateFormData = this.updateFormData.bind(this);
    }

    updateFormData(formData) {
        this.setState(Object.assign({}, this.state, {formData: formData}));
    }

    addClass(classData) {

    }

    render() {
        return (
            <Fragment>
                <CssBaseline/>
                <Grid container>
                    <Grid item lg={12}>
                        <AlmanacGraphWrapped />
                        <SearchForm updateFormData={this.updateFormData}/>
                    </Grid>
                    <Grid item lg={6}>
                        <Paper style={{maxHeight: 'inherit', overflow: 'auto', margin: 10}}>
                            <Calendar classesInCalendar={this.state.classesInCalendar}/>
                        </Paper>
                    </Grid>

                    <Grid item lg={6}>
                        <Paper style={{maxHeight: 'inherit', overflow: 'auto', margin: 10}}>
                            <CoursePane
                                formData={this.state.formData}
                            />
                        </Paper>
                    </Grid>
                </Grid></Fragment>
        );
    }
}

export default App;
