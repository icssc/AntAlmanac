import React, { Component } from 'react';
import logo from './logo.svg';
import DropdownMenu from "./Components/DropdownMenu/DropdownMenu";
import DaySelector from "./Components/DaySelector/DaySelector";
import AddCalBtn from "./Components/Buttons/AddCalBtn"
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

class App extends Component {
  render() {
    return (
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

    );
  }
}

export default App;