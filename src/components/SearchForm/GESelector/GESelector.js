import React, {Component} from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

class GESelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ge: 'ANY',
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        return (
            <FormControl style={{minWidth: 300}}> //Temporary CSS
                <InputLabel htmlFor='ge-select'>General Education</InputLabel>
                <Select
                    value={this.state.ge}
                    onChange={this.handleChange}
                    inputProps={{name:'ge', id:'ge-select'}}
                >
                    <MenuItem value={'ANY'}>All: Do not filter for GE</MenuItem>
                    <MenuItem value={'GE-1A'}>GE Ia (1a): Lower Division Writing</MenuItem>
                    <MenuItem value={'GE-1B'}>GE Ib (1b): Upper Division Writing</MenuItem>
                    <MenuItem value={'GE-2'}>GE II (2): Science and Technology</MenuItem>
                    <MenuItem value={'GE-3'}>GE III (3): Social and Behavioral Sciences</MenuItem>
                    <MenuItem value={'GE-4'}>GE IV (4): Arts and Humanities</MenuItem>
                    <MenuItem value={'GE-5A'}>GE Va (5a): Quantitative Literacy</MenuItem>
                    <MenuItem value={'GE-5B'}>GE Vb (5b): Formal Reasoning</MenuItem>
                    <MenuItem value={'GE-6'}>GE VI (6): Language other than English</MenuItem>
                    <MenuItem value={'GE-7'}>GE VII (7): Multicultural Studies</MenuItem>
                    <MenuItem value={'GE-8'}>GE VIII (8): International/Global Issues</MenuItem>
                </Select>
            </FormControl>
        );
    }
}

export default GESelector;
