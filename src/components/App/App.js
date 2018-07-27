import React, { Component } from 'react';
import DeptSearchBar from "../SearchForm/DeptSearchBar/deptsearchbar";
import GESelector from "../SearchForm/GESelector/geselector";

class App extends Component {
  render() {
    return (
        <DeptSearchBar />
        <GESelector />
    );
  }
}

export default App;
