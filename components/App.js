import React, { Component } from 'react';
import logo from './logo.svg';
import DropdownMenu from "./Components/DropdownMenu/DropdownMenu";
import DaySelector from "./Components/DaySelector/DaySelector";
import AddCalBtn from "./Components/Buttons/AddCalBtn"
import Popup from "./Components/Popup/Popup";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

class App extends React.Component {

  render() {
    return (
      <div>
        <Popup/>
      </div>
    );
  }
}

export default App;
