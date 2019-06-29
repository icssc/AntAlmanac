import React, { Component } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ge from './ge';

class GESelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ge: 'ANY',
    };

    this.handleChange = this.handleChange.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.state.ge !== nextState.ge;
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
    this.props.setGE(event.target.value);
  }

  render() {
    return (
      <FormControl style={{ flexGrow: 1, marginRight: 15, width: '50%' }}>
        <InputLabel htmlFor="ge-select">General Education</InputLabel>
        <Select
          value={this.props.ge}
          onChange={this.handleChange}
          inputProps={{ name: 'ge', id: 'ge-select' }}
          fullWidth
        >
          {ge.map((category) => {
            return (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  }
}

export default GESelector;
