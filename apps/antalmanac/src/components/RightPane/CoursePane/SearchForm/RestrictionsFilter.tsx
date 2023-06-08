import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { ChangeEvent, PureComponent } from 'react';

import RightPaneStore from '../../RightPaneStore';

const restrictionList = [
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
    'R: Biomedical Pass/Fail course (School of Medicine only)',
    'S: Satisfactory/Unsatisfactory only',
    'X: Separate authorization codes required to add, drop, or change enrollment',
];

// clean up styling later
const styles = {
    formControl: {
        flexGrow: 1,
        marginRight: 15,
        width: 120,
    },
};

// this typecasting is pretty nasty, but it won't work without it
// If there's a more proper workaround please fix/LMK
const staticRestrictionList = {
    [String('A')]: 'A: Prerequisite required',
    [String('M')]: 'M: Non-major only',
    [String('E')]: 'E: Freshmen only',
    [String('G')]: 'G: Lower-division only',
    [String('I')]: 'I: Seniors only',
    [String('N')]: 'N: School major only',
    [String('F')]: 'F: Sophomores only',
    [String('O')]: 'O: Non-school major only',
    [String('H')]: 'H: Juniors only',
    [String('J')]: 'J: Upper-division only',
    [String('C')]: 'C: Fee required',
    [String('D')]: 'D: Pass/Not Pass option only',
    [String('X')]: 'X: Separate authorization codes required to add, drop, or change enrollment',
    [String('R')]: 'R: Biomedical Pass/Fail course (School of Medicine only)',
    [String('K')]: 'K: Graduate only',
    [String('S')]: 'S: Satisfactory/Unsatisfactory only',
    [String('B')]: 'B: Authorization code required',
    [String('L')]: 'L: Major only',
};

interface RestrictionFilterProps {
    classes: ClassNameMap;
}

interface RestrictionFilterState {
    restrictions: string[];
}

// url is not being grabbed to set the values correctly on refresh
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
                      .filter((item: any) => !Array.isArray(item))
                      .map((restriction) => staticRestrictionList[restriction as string]) // Converts URL letters to the full code so the Select / Checkboxes can be checked/unchecked
                : [this.getRestrictions()],
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
                                ? this.state.restrictions.filter((item: any) => !Array.isArray(item))
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
                            <MenuItem key={restriction} value={restriction}>
                                <Checkbox checked={this.state.restrictions.indexOf(restriction) >= 0} color="default" />
                                <ListItemText primary={restriction} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
        );
    }
}

export default withStyles(styles)(RestrictionsFilter);
