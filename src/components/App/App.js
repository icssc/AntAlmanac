import React, { Component } from 'react';
import { Fragment } from 'react';
import DeptSearchBar from "../SearchForm/DeptSearchBar/deptsearchbar";
import GESelector from "../SearchForm/GESelector/geselector";
import TermSelector from "../SearchForm/termselector"

class App extends Component {
  render() {
    return (
      <Fragment>
        <DeptSearchBar />
        <GESelector />
        <TermSelector />
      </Fragment >
    );
  }
}

export default App;
