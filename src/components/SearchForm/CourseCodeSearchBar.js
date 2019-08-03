import React, { Component } from 'react';
import { TextField } from '@material-ui/core';
import PropTypes from 'prop-types';

class CourseCodeSearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseCode: '',
    };
  }

  /**
   *  Handles user input under CourseCodeSearchBar object and sets the state to its given input.
   */
  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.value }, () => {
      this.props.onAdvancedSearchChange(this.state);
    });
    //Removed unnecessary if-else statements (6-28-19)
  };

  render() {
    //const {classes} = this.props;

    return (
      <div>
        <TextField
          id="course-code"
          label="Course Code or Range"
          value={this.props.params.courseCode}
          onChange={this.handleChange('courseCode')}
          type="search"
          helperText="ex. 14200, 29000-29100"
          fullWidth
        />
      </div>
    );
  }
}

CourseCodeSearchBar.propTypes = {
  onAdvancedSearchChange: PropTypes.func,
};

export default CourseCodeSearchBar;
