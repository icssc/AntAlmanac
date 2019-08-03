import DeptSearchBar from './DeptSearchBar/DeptSearchBar';
import MobileDeptSelector from './DeptSearchBar/MobileDeptSelector';
import GESelector from './GESelector/GESelector';
import TermSelector from './TermSelector';
import CourseCodeSearchBar from './CourseCodeSearchBar';
import CourseNumberSearchBar from './CourseNumberSearchBar';
import React, { Component, Fragment } from 'react';
import { Button, Typography, Collapse } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AdvancedSearchTextFields from './AdvancedSearch';
// import MIUCI from "./MIUCI.png";
import { ExpandMore, ExpandLess } from '@material-ui/icons';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
  },
  search: {
    display: 'flex',
    justifyContent: 'center',
    borderTop: 'solid 8px transparent',
  },
  margin: {
    borderTop: 'solid 8px transparent',
    display: 'inline-flex',
  },
  // miuci: {
  //   width: "35%",
  //   position: "absolute",
  //   bottom: 0,
  //   right: 0
  // },
  new: {
    width: '55%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
};

class SearchForm extends Component {
  constructor(props) {
    super(props);

    let advanced = false;
    if (typeof Storage !== 'undefined') {
      advanced = window.localStorage.getItem('advanced');
      if (advanced === null) {
        //first time nothing stored
        advanced = false;
      } else {
        //not first
        advanced = advanced === 'expanded';
      }
    }

    if (this.props.prevFormData) {
      const {
        dept,
        label,
        term,
        ge,
        courseNum,
        courseCode,
        instructor,
        units,
        endTime,
        startTime,
        coursesFull,
        building,
      } = this.props.prevFormData;
      this.state = {
        dept: dept,
        label: label,
        ge: ge,
        term: term,
        courseNum: courseNum,
        courseCode: courseCode,
        instructor: instructor,
        units: units,
        endTime: endTime,
        startTime: startTime,
        coursesFull: coursesFull,
        building: building,
        expandAdvanced: advanced,
      };
    } else {
      this.state = {
        dept: '',
        label: '',
        ge: 'ANY',
        term: '2019 Fall',
        courseNum: '',
        courseCode: '',
        instructor: '',
        units: '',
        endTime: '',
        startTime: '',
        coursesFull: 'ANY',
        building: '',
        expandAdvanced: advanced,
      };
    }
  }

  componentDidMount = () => {
    document.addEventListener('keydown', this.enterEvent, false);
  };

  componentWillUnmount = () => {
    document.addEventListener('keydown', this.enterEvent, false);
  };

  enterEvent = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode === 13 || charCode === 10) &&
      document.activeElement.id === 'downshift-0-input'
    ) {
      this.props.updateFormData(this.state);
      event.preventDefault();

      return false;
    }
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    return this.state !== nextState;
  };

  setDept = (dept) => {
    if (dept == null) this.setState({ dept: null });
    else this.setState({ dept: dept.value, label: dept.label });
  };

  setDeptMobile = (dept) => {
    this.setState({ dept: dept });
  };

  handleAdvancedSearchChange = (advancedSearchState) => {
    this.setState(advancedSearchState);
  };

  setGE = (ge) => {
    this.setState({ ge: ge });
  };

  setTerm = (term) => {
    this.setState({ term: term });
  };

  handleExpand = () => {
    const nextExpansionState = !this.state.expandAdvanced;
    window.localStorage.setItem(
      'advanced',
      nextExpansionState ? 'expanded' : 'notexpanded'
    );
    this.setState({ expandAdvanced: nextExpansionState });
  };

  render() {
    const { classes } = this.props;
    const isMobile = window.innerWidth < 960;

    return (
      <div className={classes.container}>
        <div className={classes.margin}>
          <TermSelector term={this.state.term} setTerm={this.setTerm} />
          {isMobile ? (
            <Button
              variant="contained"
              onClick={() => this.props.updateFormData(this.state)}
              style={{
                backgroundColor: '#72a9ed',
                boxShadow: 'none',
                marginLeft: 5,
              }}
            >
              Search
            </Button>
          ) : (
            <Fragment />
          )}
        </div>

        <div className={classes.margin}>
          {isMobile ?
            (
            <MobileDeptSelector
              dept={this.state.dept}
              setDept={this.setDeptMobile}
            />
            ) : (
            <DeptSearchBar dept={this.state.label} setDept={this.setDept} />
          )}
          <CourseNumberSearchBar
            //Places CourseNumberSearchBar object next to DeptSearchBar object
            onAdvancedSearchChange={this.handleAdvancedSearchChange}
            //Handles user input for specific course number searches (e.g. "3A")
            params={this.state}
          />
        </div>

        <div className={classes.margin}>
          <GESelector ge={this.state.ge} setGE={this.setGE} />
          <CourseCodeSearchBar
            //Places CourseCodeSearchBar object next to GESelector object
            onAdvancedSearchChange={this.handleAdvancedSearchChange}
            //Handles user input for specific course code searches (e.g. "33367")
            params={this.state}
          />
        </div>

        <div
          onClick={this.handleExpand}
          style={{
            display: 'inline-flex',
            marginTop: 10,
            marginBottom: 10,
            cursor: 'pointer',
          }}
        >
          <div style={{ marginRight: 5 }}>
            <Typography noWrap variant="subheading">
              Advanced Search Options
            </Typography>
          </div>
          {this.state.expandAdvanced ? <ExpandLess /> : <ExpandMore />}
        </div>
        <Collapse in={this.state.expandAdvanced}>
          <AdvancedSearchTextFields
            params={this.state}
            onAdvancedSearchChange={this.handleAdvancedSearchChange}
          />
        </Collapse>

        <div className={classes.search}>
          {isMobile ? (
            <Fragment />
          ) : (
            <Button
              variant="contained"
              onClick={() => this.props.updateFormData(this.state)}
              style={{ backgroundColor: '#72a9ed', boxShadow: 'none' }}
            >
              Search
            </Button>
          )}
        </div>

        {/*<div className={classes.new}>
          <Typography>
            <b>New on AntAlmanac:</b>
            <br />
            Add online/TBA classes!
            <br />
            Download .ics files of your calendars!
            <br />
            See finals schedules
          </Typography>
        </div>
        <img
          src={MIUCI}
          variant="contained"
          alt="Made_in_UCI"
          className={classes.miuci}
        />*/}
      </div>
    );
  }
}

export default withStyles(styles)(SearchForm);
