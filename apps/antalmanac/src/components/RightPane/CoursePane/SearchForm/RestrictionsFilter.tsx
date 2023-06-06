// @eslint-disable-next-line
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';

const restrictionList = [
    // { value: 'ALL', label: 'ALL: Include All Restrictions' },
    // { value: 'A', label: 'A: Prerequisite required' },
    // { value: 'B', label: 'B: Authorization code required' },
    // { value: 'C', label: 'C: Fee required' },
    // { value: 'D', label: 'D: Pass/Not Pass option only' },
    // { value: 'E', label: 'E: Freshmen only' },
    // { value: 'F', label: 'F: Sophomores only' },
    // { value: 'G', label: 'G: Lower-division only' },
    // { value: 'H', label: 'H: Juniors only' },
    // { value: 'I', label: 'I: Seniors only' },
    // { value: 'J', label: 'J: Upper-division only' },
    // { value: 'K', label: 'K: Graduate only' },
    // { value: 'L', label: 'L: Major only' },
    // { value: 'M', label: 'M: Non-major only' },
    // { value: 'N', label: 'N: School major only' },
    // { value: 'O', label: 'O: Non-school major only' },
    // { value: 'R', label: 'R: Biomedical Pass/Fail course (School of Medicine only' },
    // { value: 'S', label: 'S: Satisfactory/Unsatisfactory only' },
    // { value: 'X', label: 'X: Separate authorization codes required to add, drop, or change enrollment' },

    // "All: Include All Restrictions",
    // "NONE: Filter all restrictions",
    'A: Prerequisite required',
    'B: Authorization code required',
    'C: Fee required',
    'D: Pass/Not Pass option only',
    'E: Freshmen only',
    'F: Sophomores only',
    'G: Lower-division only',
    'H: Juniors only',
    'I: Seniors only',
    'J: Upper-division only',
    'K: Graduate only',
    'L: Major only',
    'M: Non-major only',
    'N: School major only',
    'O: Non-school major only',
    'R: Biomedical Pass/Fail course (School of Medicine only',
    'S: Satisfactory/Unsatisfactory only',
    'X: Separate authorization codes required to add, drop, or change enrollment',
];

const styles = {
    formControl: {
        flexGrow: 1,
        marginRight: 15,
        width: '50%',
    },
};

interface RestrictionFilterProps {
    classes: ClassNameMap;
}

interface RestrictionFilterState {
    restrictions: string[];
}

class RestrictionsFilter extends PureComponent<RestrictionFilterProps, RestrictionFilterState> {
    updateRestrictionsAndGetFormData() {
        RightPaneStore.updateFormValue('restrictions', RightPaneStore.getUrlRestrictionsValue());
        return RightPaneStore.getFormData().restrictions;
    }

    getRestrictions() {
        return RightPaneStore.getUrlRestrictionsValue().trim()
            ? this.updateRestrictionsAndGetFormData()
            : RightPaneStore.getFormData().restrictions;
    }

    state = {
        restrictions: [
            'A: Prerequisite required',
            'B: Authorization code required',
            'C: Fee required',
            'D: Pass/Not Pass option only',
            'E: Freshmen only',
            'F: Sophomores only',
            'G: Lower-division only',
            'H: Juniors only',
            'I: Seniors only',
            'J: Upper-division only',
            'K: Graduate only',
            'L: Major only',
            'M: Non-major only',
            'N: School major only',
            'O: Non-school major only',
            'R: Biomedical Pass/Fail course (School of Medicine only',
            'S: Satisfactory/Unsatisfactory only',
            'X: Separate authorization codes required to add, drop, or change enrollment',
        ],
    };

    handleChange = (event: ChangeEvent<{ restrictions?: string | undefined; value: unknown }>) => {
        this.setState({ restrictions: event.target.value as string[] });
        RightPaneStore.updateFormValue('restrictions', event.target.value as string);

        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('Restrictions');

        const changedValue = (event.target.value as string[])
            .map((value) => value.split(':')[0].trim())
            .sort((a, b) => a.localeCompare(b))
            .join('');

        if (changedValue && changedValue !== 'ABCDEFGHIJKLMNORSX') {
            urlParam.append(
                'Restrictions',

                (event.target.value as string[])
                    .map((value) => value.split(':')[0].trim())
                    .sort((a, b) => a.localeCompare(b))
                    .join('')
            );
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
        this.setState({ restrictions: RightPaneStore.getFormData().restrictions.split(', ') });
    };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <FormControl className={classes.formControl}>
                    <InputLabel>Restrictions</InputLabel>
                    <Select
                        multiple
                        value={this.state.restrictions}
                        onChange={this.handleChange}
                        renderValue={(selected) =>
                            (selected as string[])
                                .map((value) => value.split(':')[0].trim())
                                .sort((a, b) => a.localeCompare(b))
                                .join(', ')
                        }
                        // MenuProps={MenuProps}
                    >
                        {restrictionList.map((restrictions) => (
                            <MenuItem key={restrictions} value={restrictions}>
                                <Checkbox checked={this.state.restrictions.indexOf(restrictions) > -1} />
                                <ListItemText primary={restrictions} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
        );
    }
}

export default withStyles(styles)(RestrictionsFilter);
