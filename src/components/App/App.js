import React, { Component } from 'react';
import SearchBar from "../SearchForm/SearchBar/SearchBar";
import CourseExpansionPanel from "../CoursePane/CourseExpansionPanel";
import SectionTable from "../CoursePane/SectionTable";
import CoursePane from "../CoursePane/CoursePane";

class App extends Component {
  render() {
    return (
        <div><SearchBar />
            <CoursePane /></div>

    );
  }
}

export default App;
