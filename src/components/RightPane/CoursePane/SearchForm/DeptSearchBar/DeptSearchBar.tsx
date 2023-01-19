import { TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { Autocomplete } from '@material-ui/lab';
import React, { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../../RightPaneStore';
import depts from './depts';

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

interface DeptSearchBarProps {
    classes: ClassNameMap;
}

interface Department {
    deptLabel: string;
    deptValue: string;
    isFavorite: boolean;
}

interface DeptSearchBarState {
    value: Department;
    favorites: Department[];
}

class DeptSearchBar extends PureComponent<DeptSearchBarProps, DeptSearchBarState> {
    constructor(props: DeptSearchBarProps) {
        super(props);

        let favorites: Department[] = [];
        if (typeof Storage !== 'undefined') {
            const locallyStoredFavorites = window.localStorage.getItem('favorites');
            favorites = locallyStoredFavorites !== null ? JSON.parse(locallyStoredFavorites) as Department[] : [];
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

    compareValues = (option: Department, value: Department) => {
        return option.deptValue === value.deptValue;
    };

    handleSetDept = (event: ChangeEvent<unknown>, newDept: Department | null) => {
        const setDeptValue = newDept === null ? options[0] : newDept;

        this.setState({ value: setDeptValue });
        RightPaneStore.updateFormValue('deptValue', setDeptValue.deptValue);
        RightPaneStore.updateFormValue('deptLabel', setDeptValue.deptLabel);

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
                    onChange={this.handleSetDept}
                    includeInputInList={true}
                    noOptionsText="No departments match the search"
                    groupBy={(dept) => (dept.isFavorite ? 'Recent Departments' : 'Departments')}
                    renderInput={(params) => <TextField {...params} label="Department" />}
                />
            </div>
        );
    }
}

export default withStyles(style)(DeptSearchBar);
