import React, { Component } from 'react';
import { Fragment } from 'react';
import DeptSearchBar from "../SearchForm/DeptSearchBar/DeptSearchBar";
import GESelector from "../SearchForm/GESelector/geselector";
import TermSelector from "../SearchForm/TermSelector"
import CoursePane from "../CoursePane/CoursePane";

class App extends Component {
    render() {
        return (
            <Fragment>
                <DeptSearchBar />
                <GESelector />
                <TermSelector />
                <CoursePane/>
            </Fragment >
        );
    }
}

export default App;