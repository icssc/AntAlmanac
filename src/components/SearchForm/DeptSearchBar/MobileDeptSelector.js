import React, { Component } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import depts from './depts';

class MobileDeptSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dept: '',
    };

    this.handleChange = this.handleChange.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.state.dept !== nextState.dept;
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
    this.props.setDept(event.target.value);
  }

  render() {
    return (
      <FormControl style={{ flexGrow: 1, marginRight: 15, width: '50%' }}>
        <InputLabel htmlFor="dept-select">Department</InputLabel>
        <Select
          value={this.props.dept}
          onChange={this.handleChange}
          inputProps={{ name: 'dept', id: 'dept-select' }}
          fullWidth
        >
          {depts.map((category) => {
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

export default MobileDeptSelector;
