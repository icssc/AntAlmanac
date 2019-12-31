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
        let favorites = [];
        if (typeof Storage !== 'undefined') {
            const locallyStoredFavorites = window.localStorage.getItem(
                'favorites'
            );
            favorites =
                locallyStoredFavorites !== null
                    ? JSON.parse(locallyStoredFavorites)
                    : [];
        }
        this.state = {
            filteredItems: favorites.concat(defaultDepts), // Initial state is favorites + rest
            favorites: favorites, // Just the favorites
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
                    filteredItems: this.state.favorites.concat(defaultDepts),
                });
            }
        }
    };

    handleSetDept = (dept) => {
        if (dept !== null) {
            updateFormValue('deptValue', dept.value);
            updateFormValue('deptLabel', dept.label);

            let copy_favorites = this.state.favorites;
            if (
                copy_favorites.filter((i) => i.value === dept.value).length > 0
            ) {
                // Already in favorites, reshuffle favorites array to push to front
                copy_favorites.sort((a, b) => {
                    return a.value === dept.value
                        ? -1
                        : b.value === dept.value
                        ? 1
                        : 0;
                });
            } else {
                // Not already in favorites, add to front if favorites <= 5 items long
                copy_favorites = [dept].concat(copy_favorites);
                if (copy_favorites.length > 5) {
                    copy_favorites.pop();
                }
            }

            this.setState({ favorites: copy_favorites }); //add search to front
            window.localStorage.setItem(
                'favorites',
                JSON.stringify(copy_favorites)
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
                />
            </FormControl>
        );
    }
}

export default withStyles(style)(DeptSearchBar);
