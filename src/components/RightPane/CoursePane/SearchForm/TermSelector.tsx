import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, { ChangeEvent, PureComponent } from 'react';

import { termData } from '../../../../termData';
import RightPaneStore from '../../RightPaneStore';

interface TermSelectorProps {
    changeState: (field: string, value: string) => void;
    fieldName: string;
}

class TermSelector extends PureComponent<TermSelectorProps> {
    state = {
        term: RightPaneStore.getFormData().term,
    };

    resetField = () => {
        this.setState({ term: RightPaneStore.getFormData().term });
    };

    componentDidMount = () => {
        RightPaneStore.on('formReset', this.resetField);
    };

    componentWillUnmount() {
        RightPaneStore.removeListener('formReset', this.resetField);
    }

    handleChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        this.setState({ term: event.target.value });
        this.props.changeState(this.props.fieldName, event.target.value as string);
    };

    render() {
        return (
            <FormControl fullWidth>
                <InputLabel>Term</InputLabel>
                <Select value={this.state.term} onChange={this.handleChange}>
                    {termData.map((term, index) => (
                        <MenuItem key={index} value={term.shortName}>
                            {term.longName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }
}

export default TermSelector;
