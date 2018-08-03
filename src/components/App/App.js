import React, { Component } from 'react';
import { Fragment } from 'react';
import DeptSearchBar from "../SearchForm/DeptSearchBar/DeptSearchBar";
import GESelector from "../SearchForm/GESelector/GESelector";
import TermSelector from "../SearchForm/TermSelector"
import CoursePane from "../CoursePane/CoursePane";
import Calendar from "../Calendar/Calendar";

class App extends Component {
    render() {
        return (
            <Fragment>
                <DeptSearchBar />
                <GESelector />
                <TermSelector />
                <Calendar/>
            </Fragment >
        );
    }
}

export default App;