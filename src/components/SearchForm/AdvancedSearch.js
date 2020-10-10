import React, { Component } from 'react';
import {
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = {
  courseNum: {
    borderStyle: 'solid',
    borderWidth: '0px 8px 8px 0px',
    borderColor: 'transparent',
  },
  courseCode: {
    border: 'solid 8px transparent',
    borderLeft: '0px',
    borderTop: '0px',
  },
  instructor: {
    border: 'solid 8px transparent',
    borderLeft: '0px',
    borderTop: '0px',
    minWidth: '120px',
    flexBasis: '120px',
  },
  units: {
    border: 'solid 8px transparent',
    borderLeft: '0px',
    borderTop: '0px',
    minWidth: '80px',
    flexBasis: '80px',
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
    flexWrap: 'wrap',
  },
};

class AdvancedSearchTextFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseNum: '',
      courseCode: '',
      instructor: '',
      units: '',
      endTime: '',
      startTime: '',
      coursesFull: 'ANY',
      building: this.props.params.building,
    };
  }

  handleChange = (name) => (event) => {
    if (name === 'endTime' || name === 'startTime') {
      if (event.target.value !== '') {
        if (parseInt(event.target.value.slice(0, 2), 10) > 12)
          this.setState(
            {
              [name]:
                parseInt(event.target.value.slice(0, 2), 10) - 12 + ':00pm',
            },
            () => {
              this.props.onAdvancedSearchChange(this.state);
            }
          );
        else
          this.setState(
            { [name]: parseInt(event.target.value.slice(0, 2), 10) + ':00am' },
            () => {
              this.props.onAdvancedSearchChange(this.state);
            }
          );
      } else {
        this.setState({ [name]: '' }, () => {
          this.props.onAdvancedSearchChange(this.state);
        });
      }
    } else if (name === 'online') {
      if (event.target.checked) {
        this.setState({ building: 'ON' }, () => {
          this.props.onAdvancedSearchChange(this.state);
        });
      } else {
        this.setState({ building: '' }, () => {
          this.props.onAdvancedSearchChange(this.state);
        });
      }
    } else {
      this.setState({ [name]: event.target.value }, () => {
        this.props.onAdvancedSearchChange(this.state);
      });
    }
  };

  /** 
   * UPDATE (6-28-19): Transfered course code and course number search boxes to 
   * separate classes.
  */
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.smallTextFields}>

        <TextField
          id="instructor"
          label="Instructor"
          type="search"
          value={this.props.params.instructor}
          onChange={this.handleChange('instructor')}
          className={classes.instructor}
          helperText="Last name only"
        />

        <TextField
          id="units"
          label="Units"
          value={this.props.params.units}
          onChange={this.handleChange('units')}
          type="number"
          helperText="ex. 3, 4, 1.7"
          className={classes.units}
        />

        <FormControl className={classes.coursesFull}>
          <InputLabel>Class Full Option</InputLabel>
          <Select
            value={this.props.params.coursesFull}
            onChange={this.handleChange('coursesFull')}
          >
            <MenuItem value={'ANY'}>Include all classes</MenuItem>
            <MenuItem value={'SkipFullWaitlist'}>
              Include full courses if space on waitlist
            </MenuItem>
            <MenuItem value={'SkipFull'}>Skip full courses</MenuItem>
            <MenuItem value={'FullOnly'}>
              Show only full or waitlisted courses
            </MenuItem>
            <MenuItem value={'Overenrolled'}>
              Show only over-enrolled courses
            </MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              onChange={this.handleChange('online')}
              value="online"
              color="primary"
              checked={this.state.building === 'ON'}
            />
          }
          label="Online Classes Only"
        />

        <form className={classes.timePicker}>
          <TextField
            onChange={this.handleChange('startTime')}
            label="Starts After"
            type="time"
            InputLabelProps={{
              //fix saved search params
              shrink: true,
            }}
            inputProps={{
              step: 3600,
            }}
          />
        </form>

        <form className={classes.timePicker}>
          <TextField
            onChange={this.handleChange('endTime')}
            label="Ends Before"
            type="time"
            InputLabelProps={{
              //fix saved search param
              shrink: true,
            }}
            inputProps={{
              step: 3600,
            }}
          />
        </form>
      </div>
    );
  }

  
}

AdvancedSearchTextFields.propTypes = {
    onAdvancedSearchChange: PropTypes.func,
    value: PropTypes.arrayOf({
      units: PropTypes.string,
      instructor: PropTypes.string,
      courseFull: PropTypes.string,
    }),
    building: PropTypes.string
};

export default withStyles(styles)(AdvancedSearchTextFields);
