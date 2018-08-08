import React, { Component } from 'react';
import { Fragment } from 'react';
import DeptSearchBar from "../SearchForm/DeptSearchBar/DeptSearchBar";
import GESelector from "../SearchForm/GESelector/GESelector";
import TermSelector from "../SearchForm/TermSelector"
import CoursePane from "../CoursePane/CoursePane";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";
import DropdownMenu from "../DropdownMenu/DropdownMenu";
import DaySelector from "../DaySelector/DaySelector";
import AddCalBtn from "../Buttons/AddCalBtn"
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';


class App extends Component {
    render() {
        return (
            <Fragment>
                <Grid container>
                  <Grid item lg={4}>
                    <h5>Start</h5>
                    <DropdownMenu/>
                    <h5>End</h5>
                    <DropdownMenu/>
                    <DaySelector/>
                    <AddCalBtn/>
                  </Grid>
                </Grid>
                <AlmanacGraphWrapped />
                <DeptSearchBar />
                <GESelector />
                <TermSelector />
                <CoursePane/>
            </Fragment >
        );
    }
}

export default App;
