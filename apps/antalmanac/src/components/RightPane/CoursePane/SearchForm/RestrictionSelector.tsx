import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';

const restrictionList: { value: string; label: string }[] = [
    { value: 'ALL', label: 'ALL: Include All Restrictions' },
    { value: 'A', label: 'A: Prerequisite required' },
    { value: 'B', label: 'B: Authorization code required' },
    { value: 'C', label: 'C: Fee required' },
    { value: 'D', label: 'D: Pass/Not Pass option only' },
    { value: 'E', label: 'E: Freshmen only' },
    { value: 'F', label: 'F: Sophomores only' },
    { value: 'G', label: 'G: Lower-division only' },
    { value: 'H', label: 'H: Juniors only' },
    { value: 'I', label: 'I: Seniors only' },
    { value: 'J', label: 'J: Upper-division only' },
    { value: 'K', label: 'K: Graduate only' },
    { value: 'L', label: 'L: Major only' },
    { value: 'M', label: 'M: Non-major only' },
    { value: 'N', label: 'N: School major only' },
    { value: 'O', label: 'O: Non-school major only' },
    { value: 'R', label: 'R: Biomedical Pass/Fail course (School of Medicine only' },
    { value: 'S', label: 'S: Satisfactory/Unsatisfactory only' },
    { value: 'X', label: 'X: Separate authorization codes required to add, drop, or change enrollment' },
];

const styles = {
    formControl: {
        flexGrow: 1,
        marginRight: 15,
        width: '50%',
    },
};

interface GESelectorProps {
    classes: ClassNameMap;
}

interface GESelectorState {
    ge: string;
}

class RestrictionSelector extends PureComponent<GESelectorProps, GESelectorState> {
    updateGEAndGetFormData() {
        RightPaneStore.updateFormValue('ge', RightPaneStore.getUrlGEValue());
        return RightPaneStore.getFormData().ge;
    }

    getGe() {
        return RightPaneStore.getUrlGEValue().trim() ? this.updateGEAndGetFormData() : RightPaneStore.getFormData().ge;
    }

    state = {
        ge: this.getGe(),
    };

    handleChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        this.setState({ ge: event.target.value as string });
        RightPaneStore.updateFormValue('ge', event.target.value as string);
        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('GE');
        const changedValue = event.target.value as string;
        if (changedValue && changedValue != 'ANY') {
            urlParam.append('GE', event.target.value as string);
        }
        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
    };

    componentDidMount() {
        RightPaneStore.on('formReset', this.resetField);
    }

    componentWillUnmount() {
        RightPaneStore.removeListener('formReset', this.resetField);
    }

    resetField = () => {
        this.setState({ ge: RightPaneStore.getFormData().ge });
    };

    render() {
        const { classes } = this.props;

        return (
            <FormControl className={classes.formControl}>
                <InputLabel>Restrictions</InputLabel>
                <Select value={this.state.ge} onChange={this.handleChange} fullWidth>
                    {restrictionList.map((category) => {
                        return (
                            <MenuItem key={category.value} value={category.value}>
                                {category.label}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        );
    }
}

export default withStyles(styles)(RestrictionSelector);
