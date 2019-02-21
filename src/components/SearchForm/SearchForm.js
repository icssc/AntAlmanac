import DeptSearchBar from "./DeptSearchBar/DeptSearchBar";
import GESelector from "./GESelector";
import TermSelector from "./TermSelector";
import React, {Component} from "react";
import {Button} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';
import AdvancedSearchTextFields from "./AdvancedSearch";
import MIUCI from "./MIUCI.png"

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: "relative"
  },
  search: {
    display: 'flex',
    justifyContent: 'center',
    borderTop: 'solid 8px transparent',
  },
  margin: {
    borderTop: 'solid 8px transparent',
  },
  miuci: {
    width: "35%",
    position: "absolute",
    bottom: 0,
    right: 0
  }
};

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dept: null,
      ge: "ANY",
      term: "2019 Spring",
      courseNum: "",
      courseCode: "",
      instructor: "",
      units: "",
      endTime: "",
      startTime: "",
      coursesFull: 'ANY',
      location: ""
    };
  }

  componentDidMount = () => {
    document.addEventListener("keydown", this.enterEvent, false);
  };

  componentWillUnmount = () => {
    document.addEventListener("keydown", this.enterEvent, false);
  };

  enterEvent = event => {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode === 13 || charCode === 10) &&
      document.activeElement.id === "downshift-0-input"
    ) {
      this.props.updateFormData(this.state);
      event.preventDefault();

      return false;
    }
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    return this.state !== nextState;
  };

  setDept = dept => {
    this.setState({dept: dept === null ? null : dept.value});
  };

  handleAdvancedSearchChange = (advancedSearchState) => {
    this.setState(advancedSearchState);
  };

  setGE = ge => {
    this.setState({ge: ge});
  };

  setTerm = term => {
    this.setState({term: term});
  };

  render() {
    const {classes} = this.props;

    return (
      <div className={classes.container}>
        <div className={classes.margin}>
          <DeptSearchBar setDept={this.setDept}/>
        </div>

        <div className={classes.margin}>
          <GESelector setGE={this.setGE}/>
        </div>

        <div className={classes.margin}>
          <TermSelector setTerm={this.setTerm}/>
        </div>

        <AdvancedSearchTextFields onAdvancedSearchChange={this.handleAdvancedSearchChange}/>

        <div className={classes.search}>
          <Button
            color="primary"
            variant="contained"
            onClick={() => this.props.updateFormData(this.state)}
          >
            Search
          </Button>
        </div>

        <img src={MIUCI} variant="contained" alt="Made_in_UCI" className={classes.miuci}/>

      </div>
    );
  }
}

export default withStyles(styles)(SearchForm);
