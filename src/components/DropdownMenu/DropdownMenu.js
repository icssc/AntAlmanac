import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

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

class SimpleSelect extends React.Component {
  state = {
    hour: '',
    minute: '',
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { classes } = this.props;

    return (
      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formControl}>
          <InputLabel shrink htmlFor="hour-scroll">
            Hour
          </InputLabel>
          <Select
            value={this.state.hour}
            onChange={this.handleChange}
            input={<Input name="hour" id="hour-scroll" />}
            displayEmpty
            name="hour"
            className={classes.selectEmpty}
          >

            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={7}>7</MenuItem>
            <MenuItem value={8}>8</MenuItem>
            <MenuItem value={9}>9</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={11}>11</MenuItem>
            <MenuItem value={12}>12</MenuItem>
          </Select>
          <FormHelperText>hello</FormHelperText>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel shrink htmlFor="minute-scroll">
            Minute
          </InputLabel>
          <Select
            value={this.state.minute}
            onChange={this.handleChange}
            input={<Input name="minute" id="minute-scroll" />}
            displayEmpty
            name="minute"
            className={classes.selectEmpty}
          >
            <MenuItem value={0}>:00</MenuItem>
            <MenuItem value={5}>:05</MenuItem>
            <MenuItem value={10}>:10</MenuItem>
            <MenuItem value={15}>:15</MenuItem>
            <MenuItem value={20}>:20</MenuItem>
            <MenuItem value={25}>:25</MenuItem>
            <MenuItem value={30}>:30</MenuItem>
            <MenuItem value={35}>:35</MenuItem>
            <MenuItem value={40}>:40</MenuItem>
            <MenuItem value={45}>:45</MenuItem>
            <MenuItem value={50}>:50</MenuItem>
            <MenuItem value={55}>:55</MenuItem>
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel shrink htmlFor="meridiem-scroll">
            am/pm
          </InputLabel>
          <Select
            value={this.state.meridiem}
            onChange={this.handleChange}
            input={<Input name="meridiem" id="meridiem-scroll" />}
            displayEmpty
            name="meridiem"
            className={classes.selectEmpty}
          >
            <MenuItem value={0}>am</MenuItem>
            <MenuItem value={1}>pm</MenuItem>
          </Select>
        </FormControl>

      </form>
    );
  }
}

SimpleSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleSelect);
