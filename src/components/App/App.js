import React, { Component } from 'react';
import { Fragment } from 'react';
import DeptSearchBar from "../SearchForm/DeptSearchBar/DeptSearchBar";
import GESelector from "../SearchForm/GESelector/GESelector";
import TermSelector from "../SearchForm/TermSelector"
import CoursePane from "../CoursePane/CoursePane";
import AlmanacGraphWrapped from "../AlmanacGraph/AlmanacGraph";

class App extends Component {
    render() {
        return (
            <Fragment>
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
