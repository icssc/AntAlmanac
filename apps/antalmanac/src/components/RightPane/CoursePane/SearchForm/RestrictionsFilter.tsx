import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';

// clean up styling later
const styles = {
    formControl: {
        flexGrow: 1,
        marginRight: 15,
        width: 120,
    },
};

interface RestrictionFilterProps {
    classes: ClassNameMap;
}

interface RestrictionFilterState {
    restrictions: string[];
}
const restrictionList: { value: string; label: string }[] = [
    // "All: Include All Restrictions",
    // "NONE: Filter all restrictions",
    { value: 'A', label: 'Prerequisite required' },
    { value: 'B', label: 'Authorization code required' },
    { value: 'C', label: 'Fee required' },
    { value: 'D', label: 'Pass/Not Pass option only' },
    { value: 'E', label: 'Freshmen only' },
    { value: 'F', label: 'Sophomores only' },
    { value: 'G', label: 'Lower-division only' },
    { value: 'H', label: 'Juniors only' },
    { value: 'I', label: 'Seniors only' },
    { value: 'J', label: 'Upper-division only' },
    { value: 'K', label: 'Graduate only' },
    { value: 'L', label: 'Major only' },
    { value: 'M', label: 'Non-major only' },
    { value: 'N', label: 'School major only' },
    { value: 'O', label: 'Non-school major only' },
    { value: 'R', label: 'Biomedical Pass/Fail course (School of Medicine only)' },
    { value: 'S', label: 'Satisfactory/Unsatisfactory only' },
    { value: 'X', label: 'Separate authorization codes required to add, drop, or change enrollment' },
];

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
        restrictions:
            this.getRestrictions() !== 'ALL' && typeof this.getRestrictions() === 'string' // guards for type errors
                ? this.getRestrictions()
                      .split('')
                      .filter((item: unknown): item is string => typeof item === 'string')
                : //   .map((restriction) => staticRestrictionList[restriction as string]) // Converts URL letters to the full code so the Select / Checkboxes can be checked/unchecked
                  [this.getRestrictions()],
    };

    handleChange = (event: ChangeEvent<{ restrictions?: string | undefined; value: unknown }>) => {
        let value: unknown;

        if ((event.target.value as string[])[0] == 'ALL' || Array.isArray((event.target.value as string[])[0])) {
            value = (event.target.value as string[]).slice(1);
        } else {
            value = event.target.value as string[];
        }

        this.setState(
            {
                restrictions: value as string[],
            },
            () => {
                RightPaneStore.updateFormValue('restrictions', value as unknown as string);
            }
        );

        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('restrictions');

        if ((value as string[]) && (value as string[])[0] !== undefined) {
            urlParam.append(
                'restrictions',
                (value as string[])
                    .map((value) => value.split(':')[0].trim()) // Prevents the URL from becoming too long
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
                        value={
                            Array.isArray(this.state.restrictions)
                                ? this.state.restrictions.filter(
                                      (item: unknown): item is string => typeof item === 'string'
                                  )
                                : this.state.restrictions
                        }
                        onChange={this.handleChange}
                        //some nonsense to keep renderValue clean
                        renderValue={(selected) =>
                            (selected as string[][0]) == 'ALL'
                                ? "ALL: Don't filter for restrictions"
                                : (selected as string[])
                                      .filter((item) => typeof item === 'string')
                                      .map((value) => value.split(':')[0].trim())
                                      .sort((a, b) => a.localeCompare(b))
                                      .join(', ')
                        }
                    >
                        {restrictionList.map((restriction) => (
                            <MenuItem key={restriction.value} value={restriction.value}>
                                <Checkbox
                                    checked={this.state.restrictions.indexOf(restriction.value) >= 0}
                                    color="default"
                                />
                                <ListItemText primary={`${restriction.value}: ${restriction.label}`} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
        );
    }
}

export default withStyles(styles)(RestrictionsFilter);
