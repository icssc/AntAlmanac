import React, { PureComponent } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { updateFormValue } from '../../actions/RightPaneActions';
import RightPaneStore from '../../stores/RightPaneStore.js';

class TermSelector extends PureComponent {
    state = {
        term: RightPaneStore.getFormData().term,
    };

    resetField = () => {
        this.setState({ term: RightPaneStore.getFormData().term });
    };

    componentDidMount = () => {
        document.addEventListener('keydown', this.enterEvent, false);
        RightPaneStore.on('formReset', this.resetField);
    };

    componentWillUnmount() {
        RightPaneStore.removeListener('formReset', this.resetField);
    }

    handleChange = (event) => {
        this.setState({ term: event.target.value });
        updateFormValue('term', event.target.value);
    };

    render() {
        return (
            <FormControl fullWidth>
                <InputLabel>Term</InputLabel>
                <Select value={this.state.term} onChange={this.handleChange}>
                    <MenuItem value={'2022 Winter'}>2022 Winter Quarter</MenuItem>
                    <MenuItem value={'2021 Fall'}>2021 Fall Quarter</MenuItem>
                    <MenuItem value={'2021 Spring'}>2021 Spring Quarter</MenuItem>
                    <MenuItem value={'2021 Winter'}>2021 Winter Quarter</MenuItem>
                    <MenuItem value={'2020 Fall'}>2020 Fall Quarter</MenuItem>
                    <MenuItem value={'2020 Spring'}>2020 Spring Quarter</MenuItem>
                    <MenuItem value={'2020 Winter'}>2020 Winter Quarter</MenuItem>
                    <MenuItem value={'2019 Fall'}>2019 Fall Quarter</MenuItem>
                    <MenuItem value={'2019 Summer2'}>2019 Summer Session 2</MenuItem>
                    <MenuItem value={'2019 Summer10wk'}>2019 10-wk Summer</MenuItem>
                    <MenuItem value={'2019 Summer1'}>2019 Summer Session 1</MenuItem>
                    <MenuItem value={'2019 Spring'}>2019 Spring Quarter</MenuItem>
                    <MenuItem value={'2019 Winter'}>2019 Winter Quarter</MenuItem>
                    <MenuItem value={'2018 Fall'}>2018 Fall Quarter</MenuItem>
                    <MenuItem value={'2018 Summer2'}>2018 Summer Session 2</MenuItem>
                    <MenuItem value={'2018 Summer10wk'}>2018 10-wk Summer</MenuItem>
                    <MenuItem value={'2018 Summer1'}>2018 Summer Session 1</MenuItem>
                    <MenuItem value={'2018 Spring'}>2018 Spring Quarter</MenuItem>
                    <MenuItem value={'2018 Winter'}>2018 Winter Quarter</MenuItem>
                    <MenuItem value={'2017 Fall'}>2017 Fall Quarter</MenuItem>
                    <MenuItem value={'2017 Summer2'}>2017 Summer Session 2</MenuItem>
                    <MenuItem value={'2017 Summer10wk'}>2017 10-wk Summer</MenuItem>
                    <MenuItem value={'2017 Summer1'}>2017 Summer Session 1</MenuItem>
                    <MenuItem value={'2017 Spring'}>2017 Spring Quarter</MenuItem>
                    <MenuItem value={'2017 Winter'}>2017 Winter Quarter</MenuItem>
                    <MenuItem value={'2016 Fall'}>2016 Fall Quarter</MenuItem>
                    <MenuItem value={'2016 Summer2'}>2016 Summer Session 2</MenuItem>
                    <MenuItem value={'2016 Summer10wk'}>2016 10-wk Summer</MenuItem>
                    <MenuItem value={'2016 Summer1'}>2016 Summer Session 1</MenuItem>
                    <MenuItem value={'2016 Spring'}>2016 Spring Quarter</MenuItem>
                    <MenuItem value={'2016 Winter'}>2016 Winter Quarter</MenuItem>
                    <MenuItem value={'2015 Fall'}>2015 Fall Quarter</MenuItem>
                    <MenuItem value={'2015 Summer2'}>2015 Summer Session 2</MenuItem>
                    <MenuItem value={'2015 Summer10wk'}>2015 10-wk Summer</MenuItem>
                    <MenuItem value={'2015 Summer1'}>2015 Summer Session 1</MenuItem>
                    <MenuItem value={'2015 Spring'}>2015 Spring Quarter</MenuItem>
                    <MenuItem value={'2015 Winter'}>2015 Winter Quarter</MenuItem>
                    <MenuItem value={'2014 Fall'}>2014 Fall Quarter</MenuItem>
                </Select>
            </FormControl>
        );
    }
}

export default TermSelector;
