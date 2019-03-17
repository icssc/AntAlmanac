import DeptSearchBar from "./DeptSearchBar/DeptSearchBar";
import GESelector from "./GESelector";
import TermSelector from "./TermSelector";
import React, {Component} from "react";
import {
  Button,
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails
} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';
import AdvancedSearchTextFields from "./AdvancedSearch";
import MIUCI from "./MIUCI.png";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
  },
  new: {
    width: "55%",
    position: "absolute",
    bottom: 0,
    left: 0
  }
};

class SearchForm extends Component {
  constructor(props) {
    super(props);
    if (this.props.prevFormData){
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
        building
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
          building: building
        };
    }else{
      this.state = {
        dept: null,
        label: null,
        ge: "ANY",
        term: "2019 Spring",
        courseNum: "",
        courseCode: "",
        instructor: "",
        units: "",
        endTime: "",
        startTime: "",
        coursesFull: 'ANY',
        building: ""
      };
    }
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
    if(dept==null)
      this.setState({dept: null});
    else
      this.setState({dept: dept.value,label:dept.label});
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
          <DeptSearchBar dept={this.state.label} setDept={this.setDept}/>
        </div>

        <div className={classes.margin}>
          <GESelector ge={this.state.ge} setGE={this.setGE}/>
        </div>

        <div className={classes.margin}>
          <TermSelector term={this.state.term} setTerm={this.setTerm}/>
        </div>

        <ExpansionPanel style={{marginTop: 8, marginBottom: 5}}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} >
            <Typography className="title">Advanced Search</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <AdvancedSearchTextFields params={this.state} onAdvancedSearchChange={this.handleAdvancedSearchChange}/>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <div className={classes.search}>
          <Button
            variant="contained"
            onClick={() => this.props.updateFormData(this.state)}
            style = {{backgroundColor:"#72a9ed", boxShadow:"none"}}
          >
            Search
          </Button>
        </div>

        <div className={classes.new}>
          <Typography>
            <b><u>We Are Recruiting!!</u></b><br/>
            <a href="https://www.reddit.com/r/UCI/comments/azlqcl/antalmanac_were_recruiting_coding_marketing_and/" target="_blank" rel="noopener noreferrer">Coding, Marketing, Everything!</a><br/>
            <b>New on AntAlmanac:</b><br/>
            Text message notifications<br/>
            Links to interactive campus map<br/>
            See finals schedules
          </Typography>
        </div>

        <img
          src={MIUCI}
          variant="contained"
          alt="Made_in_UCI"
          className={classes.miuci}
        />

      </div>
    );
  }
}

export default withStyles(styles)(SearchForm);
