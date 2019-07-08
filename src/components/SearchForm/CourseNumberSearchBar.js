import React, { Component } from 'react';
import { TextField } from '@material-ui/core';
import PropTypes from 'prop-types';

class CourseNumberSearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      courseCode: '',
    };
  }

  /**
   *  Handles user input under CourseNumberSearchBar object and sets the state to its given input.
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
          id="course-num"
          label="Course Number(s)"
          type="search"
          value={this.props.params.courseNum}
          onChange={this.handleChange('courseNum')}
          helperText="ex. 6B, 17, 30-40"
        />
      </div>
    );
  }
}

CourseNumberSearchBar.propTypes = {
  onAdvancedSearchChange: PropTypes.func,
};

export default CourseNumberSearchBar;
