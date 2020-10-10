import React from 'react';
import Downshift from 'mui-downshift';
import depts from './depts';
import FormControl from '@material-ui/core/FormControl';
import { isMobile } from 'react-device-detect';
import PropTypes from 'prop-types';

class DeptSearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filteredItems: depts }; // Inital state is the whole list of depts
    this.handleStateChange = this.handleStateChange.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextState !== this.state;
  }

  determineDropdownLength() {
    if (isMobile) {
      return 3;
    }
    // return document.documentElement.scrollHeight
    // - 96 - 24;
    return 6;
  }

  handleStateChange(changes) {
    if (typeof changes.inputValue === 'string') {
      // Match depts by label (ignoring case) and filter out the non matching depts
      const filteredItems = depts.filter((item) =>
        item.label.toLowerCase().includes(changes.inputValue.toLowerCase())
      );
      this.setState({ filteredItems });
    }
  }

  defautlRen = () => {
    return { label: this.props.dept, value: 0 };
  };

  render() {
    return (
      <FormControl 
        style={{ flexGrow: 1, marginRight: 15, width: '50%' }}
          //Fixes positioning of DeptSearchBar next to CodeNumberSearchBar
      >
        <Downshift
          items={this.state.filteredItems}
          onStateChange={this.handleStateChange}
          defaultSelectedItem={this.defautlRen()}
          onChange={this.props.setDept}
          getInputProps={() => ({
            // Downshift requires this syntax to pass down these props to the text field
            label: 'Department',
            required: true,
          })}
          //getInputProps={() => <input />}
          menuItemCount={this.determineDropdownLength()}
          // menuHeight={this.determineDropdownLength()}
          {...this.props} //Pass down other props to the Downshift layer
        />
      </FormControl>
    );
  }
}

DeptSearchBar.propTypes = {
    label: PropTypes.string,
    onChange: PropTypes.bool,
};
export default DeptSearchBar;
