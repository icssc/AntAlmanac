import React, {Component} from 'react';
import {Fragment} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid';
import DeptSearchBar from "../SearchForm/DeptSearchBar/DeptSearchBar";
import GESelector from "../SearchForm/GESelector/GESelector";
import TermSelector from "../SearchForm/TermSelector"
import SearchButton from "../SearchForm/SearchButton"
import CoursePane from "../CoursePane/CoursePane";
import Calendar from "../Calendar/Calendar";
import Paper from "@material-ui/core/Paper";

class App extends Component {
    render() {
        return (
            <Fragment>
                <CssBaseline/>
                <Grid container>
                    <Grid item lg={3}>
                        <DeptSearchBar/>
                    </Grid>

                    <Grid item lg={3}>
                        <GESelector/>
                    </Grid>

                    <Grid item lg={3}>
                        <TermSelector/>
                    </Grid>

                    <Grid item lg={3}>
                        <SearchButton/>
                    </Grid>

                    <Grid item lg={6}>
                        <Paper style={{maxHeight: 'inherit', overflow: 'auto', margin:10}}>
                            <Calendar/>
                        </Paper>
                    </Grid>

                    <Grid item lg={6}>
                        <Paper style={{maxHeight: 'inherit', overflow: 'auto', margin:10}}>
                            <CoursePane/>
                        </Paper>
                    </Grid>
                </Grid></Fragment>

        );
    }
}

export default App;