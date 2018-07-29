import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
});

class TermSelector extends React.Component {
  state = {
      year: '',
      quarter: '',
    };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <FormControl required className={classes.formControl}>
          <InputLabel htmlFor="quarter-simple-required">Quarter</InputLabel>
          <Select
            value={this.state.quarter}
            onChange={this.handleChange('quarter')}
            name="quarter"
            inputProps={{
              id: 'quarter-simple-required',
            }}
          >
            <option value="" />
            <option value={"F"}>Fall</option>
            <option value={"W"}>Winter</option>
            <option value={"S"}>Spring</option>
            <option value={"SS1"}>Sum I</option>
            <option value={"SS10"}>Sum 10</option>
            <option value={"SS2"}>Sum II</option>
          </Select>
          <FormHelperText>Required</FormHelperText>
        </FormControl>

        <FormControl required className={classes.formControl}>
          <InputLabel htmlFor="year-simple-required">Year</InputLabel>
          <Select
            value={this.state.year}
            onChange={this.handleChange('year')}
            name="year"
            inputProps={{
              id: 'year-simple-required',
            }}
          >
            <option value="" />
            <option value={2018}>2018</option>
            <option value={2017}>2017</option>
            <option value={2016}>2016</option>
            <option value={2015}>2015</option>
            <option value={2014}>2014</option>
          </Select>
          <FormHelperText>Required</FormHelperText>
        </FormControl>
      </div>
    );
  }
}

TermSelector.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TermSelector);
