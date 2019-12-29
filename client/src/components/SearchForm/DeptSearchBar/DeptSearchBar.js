import React from 'react';
import Downshift from 'mui-downshift';
import defaultDepts from './depts';
import FormControl from '@material-ui/core/FormControl';
import { isMobile } from 'react-device-detect';
import { updateFormValue } from '../../../actions/RightPaneActions';
import RightPaneStore from '../../../stores/RightPaneStore.js';
import { withStyles } from '@material-ui/core/styles';

const style = {
    formControl: {
        flexGrow: 1,
        marginRight: 15,
        width: '50%',
    },
};

class DeptSearchBar extends React.Component {
    constructor(props) {
        super(props);
        let history = [];
        if (typeof Storage !== 'undefined') {
            history = JSON.parse(window.localStorage.getItem('history'));
        }
        this.state = {
            filteredItems: history.concat(defaultDepts), // Inital state is history + rest
            history: history, // Just the history
        };
    }

    determineDropdownLength = () => {
        if (isMobile) {
            return 3;
        }
        // return document.documentElement.scrollHeight
        // - 96 - 24;
        return 6;
    };

    handleFilterDepts = (changes) => {
        if (typeof changes.inputValue === 'string') {
            if (changes.inputValue !== '') {
                // Match depts by label (ignoring case) and filter out the non matching depts
                // if change is string and not empty string
                const filteredItems = defaultDepts.filter((item) =>
                    item.label
                        .toLowerCase()
                        .includes(changes.inputValue.toLowerCase())
                );
                this.setState({ filteredItems });
            } else {
                // if change is empty string: reset to depts
                this.setState({
                    filteredItems: this.state.history.concat(defaultDepts),
                });
            }
        }
    };

    handleSetDept = (dept) => {
        if (dept !== null) {
            updateFormValue('deptValue', dept.value);
            updateFormValue('deptLabel', dept.label);

            let copy_history = this.state.history;
            if (copy_history.filter((i) => i.value === dept.value).length > 0) {
                // Already in history, reshuffle history array to push to front
                copy_history.sort((a, b) => {
                    return a.value === dept.value
                        ? -1
                        : b.value === dept.value
                        ? 1
                        : 0;
                });
            } else {
                // Not already in history, add to front if history <= 5 items long
                copy_history = [dept].concat(copy_history);
                if (copy_history.length > 5) {
                    copy_history.pop();
                }
            }

            this.setState({ history: copy_history }); //add search to front
            window.localStorage.setItem(
                'history',
                JSON.stringify(copy_history)
            );
        } else {
            updateFormValue('deptValue', null);
            updateFormValue('deptLabel', null);
        }
    };

    render() {
        const { classes } = this.props;

        return (
            <FormControl
                className={classes.formControl}
                //Fixes positioning of DeptSearchBar next to CodeNumberSearchBar
            >
                <Downshift
                    items={this.state.filteredItems}
                    onStateChange={this.handleFilterDepts}
                    defaultSelectedItem={{
                        label: RightPaneStore.getFormData().deptLabel,
                        value: RightPaneStore.getFormData().deptValue,
                    }}
                    onChange={this.handleSetDept}
                    getInputProps={() => ({
                        // Downshift requires this syntax to pass down these props to the text field
                        label: 'Type to search department',
                        required: true,
                    })}
                    menuItemCount={this.determineDropdownLength()}
                    // menuHeight={this.determineDropdownLength()}
                />
            </FormControl>
        );
    }
}

export default withStyles(style)(DeptSearchBar);
