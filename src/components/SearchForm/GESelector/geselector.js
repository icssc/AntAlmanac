import React, {Component} from 'react';
import ge from './ge.json';
import MuiDownshift from 'mui-downshift';


const items = ge.map((label, value) => ({label, value}));

class GESelector extends Component {
    constructor(props) {
        super(props);
        this.state = {filteredItems: items}; // Inital state is the whole list of GEs
        this.handleStateChange = this.handleStateChange.bind(this);
    }

    handleStateChange(changes) {
        if (typeof changes.inputValue === 'string') {
            // Match depts by label (ignoring case) and filter out the non matching depts
            const filteredItems = items.filter(item => item.label.toLowerCase().includes(changes.inputValue.toLowerCase()));
            this.setState({filteredItems});
        }
    };

    render() {
        return (
            <MuiDownshift
                items={this.state.filteredItems}
                onStateChange={this.handleStateChange}
                getInputProps={() => ({     // Downshift requires this syntax to pass down these props to the text field
                    label: 'GE',
                    required: true,
                })}
                {...this.props} //Pass down other props to the Downshift layer
            />
        );
    }
}

export default GESelector;
