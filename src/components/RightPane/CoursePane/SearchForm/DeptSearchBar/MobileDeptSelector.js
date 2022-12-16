import React, { PureComponent } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import depts from './depts';
import { updateFormValue } from '../../../../stores/RightPaneStore';
import RightPaneStore from '../../../RightPaneStore';
import { withStyles } from '@mui/styles';

const style = {
    formControl: {
        flexGrow: 1,
        marginRight: 15,
        width: '50%',
    },
};

class MobileDeptSelector extends PureComponent {
    state = {
        deptLabel: RightPaneStore.getFormData().deptLabel,
    };

    handleChange = (event) => {
        this.setState({ deptLabel: event.target.value });
        updateFormValue('deptLabel', event.target.value);
    };

    render() {
        const { classes } = this.props;

        return (
            <FormControl className={classes.formControl}>
                <InputLabel>Department</InputLabel>
                <Select value={this.state.deptLabel} onChange={this.handleChange} fullWidth>
                    {depts.map((dept) => {
                        return (
                            <MenuItem key={dept.value} value={dept.value}>
                                {dept.label}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        );
    }
}

export default withStyles(style)(MobileDeptSelector);
