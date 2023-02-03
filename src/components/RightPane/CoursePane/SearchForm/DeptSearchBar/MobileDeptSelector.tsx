import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { withStyles } from '@mui/styles';
import { ClassNameMap } from '@mui/styles/withStyles';
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

interface MobileDeptSelectorProps {
    classes: ClassNameMap;
}

interface MobileDeptSelectorState {
    deptLabel: string | unknown;
}

class MobileDeptSelector extends PureComponent<MobileDeptSelectorProps, MobileDeptSelectorState> {
    state = {
        deptLabel: RightPaneStore.getFormData().deptLabel,
    };

    handleChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        this.setState({ deptLabel: event.target.value });
        RightPaneStore.updateFormValue('deptLabel', event.target.value as string);
    };

    render() {
        const { classes } = this.props;

        return (
            <FormControl className={classes.formControl}>
                <InputLabel>Department</InputLabel>
                <Select value={this.state.deptLabel} onChange={this.handleChange} fullWidth>
                    {depts.map((dept) => {
                        return (
                            <MenuItem key={dept.deptValue} value={dept.deptValue}>
                                {dept.deptLabel}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        );
    }
}

export default withStyles(style)(MobileDeptSelector);
