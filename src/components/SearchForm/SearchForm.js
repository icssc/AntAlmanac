import Grid from "@material-ui/core/Grid";
import DeptSearchBar from "./DeptSearchBar/DeptSearchBar";
import GESelector from "./GESelector/GESelector";
import TermSelector from "./TermSelector";
import React, { Component } from "react";
import Button from "@material-ui/core/Button";

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = { dept: null, ge: "ANY", term: "2019 Winter" };
    this.setDept = this.setDept.bind(this);
    this.setGE = this.setGE.bind(this);
    this.setTerm = this.setTerm.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.enterEvent, false);
  }
  componentWillUnmount() {
    document.addEventListener("keydown", this.enterEvent, false);
  }
  enterEvent = event => {
    var charCode = event.which ? event.which : event.keyCode;
    if (
      (charCode === 13 || charCode == 10) &&
      document.activeElement.id == "downshift-0-input"
    ) {
      this.props.updateFormData(this.state);
      event.preventDefault();
      console.log("dddxxxxx", document.activeElement.id);

      // this.refs.input.blur();
      return false;
    }
  };
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.state !== nextState;
  }

  setDept(dept) {
    this.setState({ dept: dept === null ? null : dept.value });
  }

  setGE(ge) {
    this.setState({ ge: ge });
  }

  setTerm(term) {
    this.setState({ term: term });
  }

  render() {
    return (
      <Grid
        container
        item
        alignItems="center"
        alignContent="center"
        justify="center"
        spacing={0}
      >
        <Grid item lg={3} xs={12}>
          <DeptSearchBar setDept={this.setDept} />
        </Grid>

        <Grid item lg={3} xs={12}>
          <GESelector setGE={this.setGE} />
        </Grid>

        <Grid item lg={3} xs={12}>
          <TermSelector setTerm={this.setTerm} />
        </Grid>

        <Grid item lg={1} xs={6}>
          <Button
            color="primary"
            variant="contained"
            onClick={() => this.props.updateFormData(this.state)}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default SearchForm;
