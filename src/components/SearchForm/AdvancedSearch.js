import React, {Component} from 'react';
import {MenuItem, Select, TextField, FormControl, InputLabel} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';

const styles = {
  courseNum: {
    borderStyle: 'solid',
    borderWidth: '8px 8px 8px 0px',
    borderColor: 'transparent',
  },
  courseCode: {
    border: 'solid 8px transparent',
    borderLeft: '0px',
  },
  instructor: {
    border: 'solid 8px transparent',
    borderLeft: '0px',
    minWidth: '120px',
    flexBasis: '120px'
  },
  units: {
    border: 'solid 8px transparent',
    borderLeft: '0px',
    minWidth: '80px',
    flexBasis: '80px'
  },
  coursesFull: {
    borderWidth: '8px 0px 8px 0px',
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  timePicker: {
    borderWidth: '8px 0px 8px 0px',
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  smallTextFields: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
};

class AdvancedSearchTextFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseNum: "",
      courseCode: "",
      instructor: "",
      units: "",
      endTime: "",
      startTime: "",
      coursesFull: 'ANY'
    }
  }

  handleChange = name => event => {
    if (name === "endTime" || name === "startTime") {
      if (event.target.value !== "") {
        if (parseInt(event.target.value.slice(0, 2), 10) > 12)
          this.setState({[name]: (parseInt(event.target.value.slice(0, 2), 10) - 12) + ":00pm"}, () => {
            this.props.onAdvancedSearchChange(this.state)
          });
        else
          this.setState({[name]: parseInt(event.target.value.slice(0, 2), 10) + ":00am"}, () => {
            this.props.onAdvancedSearchChange(this.state)
          });
      } else {
        this.setState({[name]: ""}, () => {
          this.props.onAdvancedSearchChange(this.state)
        });
      }
    } else {
      this.setState({[name]: event.target.value}, () => {
        this.props.onAdvancedSearchChange(this.state)
      });
    }
  };

  render() {
    const {classes} = this.props;

    return (
      <div className={classes.smallTextFields}>
        <TextField
          id="course-num"
          label="Course Number(s)"
          type="search"
          value={this.state.courseNum}
          onChange={this.handleChange('courseNum')}
          className={classes.courseNum}
          helperText="ex. 6B, 17, 30-40"
        />

        <TextField
          id="course-code"
          label="Course Code or Range"
          value={this.state.courseCode}
          onChange={this.handleChange('courseCode')}
          type="search"
          helperText="ex. 14200, 29000-29100"
          className={classes.courseCode}
        />

        <TextField
          id="instructor"
          label="Instructor"
          type="search"
          value={this.state.instructor}
          onChange={this.handleChange('instructor')}
          className={classes.instructor}
          helperText="Last name only"
        />

        <TextField
          id="units"
          label="Units"
          value={this.state.units}
          onChange={this.handleChange('units')}
          type="number"
          helperText="ex. 3, 4, 1.7"
          className={classes.units}
        />

        <FormControl className={classes.coursesFull}>
          <InputLabel>Term</InputLabel>
          <Select
            value={this.state.coursesFull}
            onChange={this.handleChange('coursesFull')}
          >
            <MenuItem value={"ANY"}>Include all classes</MenuItem>
            <MenuItem value={"SkipFullWaitlist"}>Include full courses if space on waitlist</MenuItem>
            <MenuItem value={"SkipFull"}>Skip full courses</MenuItem>
            <MenuItem value={"FullOnly"}>Show only full or waitlisted courses</MenuItem>
            <MenuItem value={"Overenrolled"}>Show only over-enrolled courses</MenuItem>
          </Select>
        </FormControl>

        <form className={classes.timePicker}>
          <TextField
            onChange={this.handleChange('startTime')}
            label='Starts After'
            type="time"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 3600
            }}
          />
        </form>
        <form className={classes.timePicker}>
          <TextField
            onChange={this.handleChange('endTime')}
            label='Ends Before'
            type="time"
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              step: 3600
            }}
          />
        </form>
      </div>
    );
  }
}

export default withStyles(styles)(AdvancedSearchTextFields);
