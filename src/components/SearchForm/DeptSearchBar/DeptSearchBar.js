import React from 'react';
import Downshift from 'mui-downshift';
import defaultDepts from './depts';
import FormControl from '@material-ui/core/FormControl';
import { isMobile } from 'react-device-detect';
import PropTypes from 'prop-types';

class DeptSearchBar extends React.Component {
  constructor(props) {
    super(props);
    let history = null;
    if (typeof Storage !== 'undefined') {
      history = JSON.parse(window.localStorage.getItem('history'));
    }
    if (history === null) {
      //nothing stored
      history = [];
    }
    this.state = {
      filteredItems: history.concat(defaultDepts), // Inital state is history + rest
      history: history, // Just the history
    };
    this.handleFilterDepts = this.handleFilterDepts.bind(this);
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

  handleFilterDepts(changes) {
    if (typeof changes.inputValue === 'string') {
      if (changes.inputValue !== '') {
        // Match depts by label (ignoring case) and filter out the non matching depts
        // if change is string and not empty string
        const filteredItems = defaultDepts.filter((item) =>
          item.label.toLowerCase().includes(changes.inputValue.toLowerCase())
        );
        this.setState({ filteredItems });
      } else {
        // if change is empty string: reset to depts
        this.setState({
          filteredItems: this.state.history.concat(defaultDepts),
        });
      }
    }
  }

  defautlRen = () => {
    return { label: this.props.dept, value: 0 };
  };

  handleSetDept = (dept) => {
    if (dept !== null) {
      this.props.setDept(dept); //set it in search form

      let copy_history = this.state.history;
      if (copy_history.filter((i) => i.value === dept.value).length > 0) {
        // Already in history, reshuffle history array to push to front
        copy_history.sort((a, b) => {
          return a.value === dept.value ? -1 : b.value === dept.value ? 1 : 0;
        });
      } else {
        // Not already in history, add to front if history <= 5 items long
        copy_history = [dept].concat(copy_history);
        if (copy_history.length > 5) {
          copy_history.pop();
        }
      }

      this.setState({ history: copy_history }); //add search to front
      window.localStorage.setItem('history', JSON.stringify(copy_history));
    } else {
      this.props.setDept(null);
    }
  };

  render() {
    return (
      <FormControl
        style={{ flexGrow: 1, marginRight: 15, width: '50%' }}
        //Fixes positioning of DeptSearchBar next to CodeNumberSearchBar
      >
        <Downshift
          items={this.state.filteredItems}
          onStateChange={this.handleFilterDepts}
          defaultSelectedItem={this.defautlRen()}
          onChange={this.handleSetDept}
          getInputProps={() => ({
            // Downshift requires this syntax to pass down these props to the text field
            label: 'Type to search department',
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
