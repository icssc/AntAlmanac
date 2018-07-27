import React, { Component } from 'react';
import DeptSearchBar from "../SearchForm/DeptSearchBar/deptsearchbar";
import GESelector from "../SearchForm/GESelector/geselector";

class App extends Component {
  render() {
    return (
      <div>
        <DeptSearchBar />
        <GESelector />
      </div>
    );
  }
}

export default App;
