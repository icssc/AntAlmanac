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
      term: '',
    };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <FormControl required className={classes.formControl}>
          <InputLabel htmlFor="term-simple-required">Please select a term</InputLabel>
          <Select
            value={this.state.term}
            onChange={this.handleChange('term')}
            name="term"
            inputProps={{
              id: 'term-simple-required',
            }}
          >
            <option value="2018-92" style="color: purple" selected="selected">2018  Fall Quarter</option>
  			    <option value="2018-76" style="color: #744a00">2018  Summer Session 2</option>
  			    <option value="2018-51" style="color: #555">2018  Summer Qtr (COM)</option>
  			    <option value="2018-39" style="color: #744a00">2018  10-wk Summer</option>
  			    <option value="2018-25" style="color: #744a00">2018  Summer Session 1</option>
  			    <option value="2018-14" style="color: purple">2018  Spring Quarter</option>
  			    <option value="2018-03" style="color: purple">2018  Winter Quarter</option>
  			    <option value="2017-92" style="color: purple">2017  Fall Quarter</option>
  			    <option value="2017-76" style="color: #744a00">2017  Summer Session 2</option>
  			    <option value="2017-51" style="color: #555">2017  Summer Qtr (COM)</option>
  			    <option value="2017-39" style="color: #744a00">2017  10-wk Summer</option>
  			    <option value="2017-25" style="color: #744a00">2017  Summer Session 1</option>
  			    <option value="2017-14" style="color: purple">2017  Spring Quarter</option>
  			    <option value="2017-03" style="color: purple">2017  Winter Quarter</option>
  			    <option value="2016-92" style="color: purple">2016  Fall Quarter</option>
  			    <option value="2016-76" style="color: #744a00">2016  Summer Session 2</option>
  			    <option value="2016-51" style="color: #555">2016  Summer Qtr (COM)</option>
  			    <option value="2016-39" style="color: #744a00">2016  10-wk Summer</option>
  			    <option value="2016-25" style="color: #744a00">2016  Summer Session 1</option>
  			    <option value="2016-14" style="color: purple">2016  Spring Quarter</option>
  			    <option value="2016-03" style="color: purple">2016  Winter Quarter</option>
  			    <option value="2015-92" style="color: purple">2015  Fall Quarter</option>
  			    <option value="2015-76" style="color: #744a00">2015  Summer Session 2</option>
  			    <option value="2015-51" style="color: #555">2015  Summer Qtr (COM)</option>
  			    <option value="2015-39" style="color: #744a00">2015  10-wk Summer</option>
  			    <option value="2015-25" style="color: #744a00">2015  Summer Session 1</option>
  			    <option value="2015-14" style="color: purple">2015  Spring Quarter</option>
  			    <option value="2015-03" style="color: purple">2015  Winter Quarter</option>
  			    <option value="2014-92" style="color: purple">2014  Fall Quarter</option>
  			    <option value="2014-76" style="color: #744a00">2014  Summer Session 2</option>
  			    <option value="2014-51" style="color: #555">2014  Summer Qtr (COM)</option>
  			    <option value="2014-39" style="color: #744a00">2014  10-wk Summer</option>
  			    <option value="2014-25" style="color: #744a00">2014  Summer Session 1</option>
  			    <option value="2014-14" style="color: purple">2014  Spring Quarter</option>
  			    <option value="2014-03" style="color: purple">2014  Winter Quarter</option>
  			    <option value="2013-92" style="color: purple">2013  Fall Quarter</option>
  			    <option value="2013-76" style="color: #744a00">2013  Summer Session 2</option>
  			    <option value="2013-51" style="color: #555">2013  Summer Qtr (COM)</option>
  			    <option value="2013-39" style="color: #744a00">2013  10-wk Summer</option>
  			    <option value="2013-25" style="color: #744a00">2013  Summer Session 1</option>
  			    <option value="2013-14" style="color: purple">2013  Spring Quarter</option>
  			    <option value="2013-03" style="color: purple">2013  Winter Quarter</option>
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
