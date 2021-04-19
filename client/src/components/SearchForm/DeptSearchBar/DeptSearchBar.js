import React, { PureComponent } from 'react';
import depts from './depts';
import { updateFormValue } from '../../../actions/RightPaneActions';
import { withStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import RightPaneStore from '../../../stores/RightPaneStore';

const style = {
    formControl: {
        flexGrow: 1,
        marginRight: 15,
        width: '50%',
    },
};

const options = depts.map((dept) => {
    return {
        ...dept,
        isFavorite: false,
    };
});

class DeptSearchBar extends PureComponent {
    constructor(props) {
        super(props);

        let favorites = [];
        if (typeof Storage !== 'undefined') {
            const locallyStoredFavorites = window.localStorage.getItem('favorites');
            favorites = locallyStoredFavorites !== null ? JSON.parse(locallyStoredFavorites) : [];
        }
        this.state = {
            value: {
                deptValue: RightPaneStore.getFormData().deptValue,
                deptLabel: RightPaneStore.getFormData().deptLabel,
                isFavorite: false,
            },
            favorites: favorites,
        };
    }

    componentDidMount() {
        RightPaneStore.on('formReset', this.resetField);
    }

    componentWillUnmount() {
        RightPaneStore.removeListener('formReset', this.resetField);
    }

    resetField = () => {
        this.setState({
            value: {
                deptValue: RightPaneStore.getFormData().deptValue,
                deptLabel: RightPaneStore.getFormData().deptLabel,
                isFavorite: false,
            },
        });
    };

    compareValues = (option, value) => {
        return option.deptValue === value.deptValue;
    };

    handleSetDept = (event, newDept) => {
        let setDeptValue = newDept === null ? options[0] : newDept;

        this.setState({ value: setDeptValue });
        updateFormValue('deptValue', setDeptValue.deptValue);
        updateFormValue('deptLabel', setDeptValue.deptLabel);

        if (newDept === null || newDept.deptValue === 'ALL') return;

        const favorites = this.state.favorites;
        let updatedFavorites = [...favorites];

        if (favorites.filter((favorite) => newDept.deptValue === favorite.deptValue).length > 0) {
            updatedFavorites.sort((a, b) => {
                return a.deptValue === newDept.deptValue ? -1 : b.deptValue === newDept.deptValue ? 1 : 0;
            });
        } else {
            updatedFavorites = [{ ...newDept, isFavorite: true }].concat(favorites);
            if (updatedFavorites.length > 5) updatedFavorites.pop();
        }
        this.setState({ favorites: updatedFavorites });
        window.localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.formControl}>
                <Autocomplete
                    value={this.state.value}
                    options={this.state.favorites.concat(options)}
                    autoHighlight={true}
                    openOnFocus={true}
                    getOptionSelected={this.compareValues}
                    getOptionLabel={(option) => option.deptLabel}
                    blurOnSelect
                    onChange={this.handleSetDept}
                    includeInputInList={true}
                    noOptionsText="No departments match the search"
                    groupBy={(dept) => (dept.isFavorite ? 'Recent Departments' : 'Departments')}
                    renderInput={(params) => <TextField {...params} label="Search for a department" />}
                />
            </div>
        );
    }
}

export default withStyles(style)(DeptSearchBar);
