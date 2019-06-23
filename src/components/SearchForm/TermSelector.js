import React, { Component } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

class TermSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      term: '2019 Fall',
    };

    this.handleChange = this.handleChange.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.state.term !== nextState.term;
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
    this.props.setTerm(event.target.value);
  }

  render() {
    return (
      <FormControl fullWidth>
        <InputLabel htmlFor="term-select">Term</InputLabel>
        <Select
          value={this.props.term}
          onChange={this.handleChange}
          inputProps={{ name: 'term', id: 'term-select' }}
        >
          <MenuItem value={'2019 Fall'}>2019 Fall Quarter</MenuItem>
          <MenuItem value={'2019 Summer2'}>2019 Summer Session 2</MenuItem>
          <MenuItem value={'2019 Summer10wk'}>2019 10-wk Summer</MenuItem>
          <MenuItem value={'2019 Summer1'}>2019 Summer Session 1</MenuItem>
          <MenuItem value={'2019 Spring'}>2019 Spring Quarter</MenuItem>
          <MenuItem value={'2019 Winter'}>2019 Winter Quarter</MenuItem>
          <MenuItem value={'2018 Fall'}>2018 Fall Quarter</MenuItem>
          <MenuItem value={'2018 Summer2'}>2018 Summer Session 2</MenuItem>
          <MenuItem value={'2018 Summer10wk'}>2018 10-wk Summer</MenuItem>
          <MenuItem value={'2018 Summer1'}>2018 Summer Session 1</MenuItem>
          <MenuItem value={'2018 Spring'}>2018 Spring Quarter</MenuItem>
          <MenuItem value={'2018 Winter'}>2018 Winter Quarter</MenuItem>
          <MenuItem value={'2017 Fall'}>2017 Fall Quarter</MenuItem>
          <MenuItem value={'2017 Summer2'}>2017 Summer Session 2</MenuItem>
          <MenuItem value={'2017 Summer10wk'}>2017 10-wk Summer</MenuItem>
          <MenuItem value={'2017 Summer1'}>2017 Summer Session 1</MenuItem>
          <MenuItem value={'2017 Spring'}>2017 Spring Quarter</MenuItem>
          <MenuItem value={'2017 Winter'}>2017 Winter Quarter</MenuItem>
          <MenuItem value={'2016 Fall'}>2016 Fall Quarter</MenuItem>
          <MenuItem value={'2016 Summer2'}>2016 Summer Session 2</MenuItem>
          <MenuItem value={'2016 Summer10wk'}>2016 10-wk Summer</MenuItem>
          <MenuItem value={'2016 Summer1'}>2016 Summer Session 1</MenuItem>
          <MenuItem value={'2016 Spring'}>2016 Spring Quarter</MenuItem>
          <MenuItem value={'2016 Winter'}>2016 Winter Quarter</MenuItem>
          <MenuItem value={'2015 Fall'}>2015 Fall Quarter</MenuItem>
          <MenuItem value={'2015 Summer2'}>2015 Summer Session 2</MenuItem>
          <MenuItem value={'2015 Summer10wk'}>2015 10-wk Summer</MenuItem>
          <MenuItem value={'2015 Summer1'}>2015 Summer Session 1</MenuItem>
          <MenuItem value={'2015 Spring'}>2015 Spring Quarter</MenuItem>
          <MenuItem value={'2015 Winter'}>2015 Winter Quarter</MenuItem>
          <MenuItem value={'2014 Fall'}>2014 Fall Quarter</MenuItem>
          <MenuItem value={'2014 Summer2'}>2014 Summer Session 2</MenuItem>
          <MenuItem value={'2014 Summer10wk'}>2014 10-wk Summer</MenuItem>
          <MenuItem value={'2014 Summer1'}>2014 Summer Session 1</MenuItem>
          <MenuItem value={'2014 Spring'}>2014 Spring Quarter</MenuItem>
          <MenuItem value={'2014 Winter'}>2014 Winter Quarter</MenuItem>
          <MenuItem value={'2013 Fall'}>2013 Fall Quarter</MenuItem>
          <MenuItem value={'2013 Summer2'}>2013 Summer Session 2</MenuItem>
          <MenuItem value={'2013 Summer10wk'}>2013 10-wk Summer</MenuItem>
          <MenuItem value={'2013 Summer1'}>2013 Summer Session 1</MenuItem>
          <MenuItem value={'2013 Spring'}>2013 Spring Quarter</MenuItem>
          <MenuItem value={'2013 Winter'}>2013 Winter Quarter</MenuItem>
        </Select>
      </FormControl>
    );
  }
}

export default TermSelector;
