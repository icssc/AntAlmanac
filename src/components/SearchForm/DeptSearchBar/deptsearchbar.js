import React, {Component} from 'react';
import depts from './depts.json';
import MuiDownshift from 'mui-downshift';

// TODO: Maps department codes to index value.
//       Later, we will change this to map dept name to dept code, like {'Chemistry': 'CHEM'}
const items = depts.map((label, value) => ({label, value}));

class DeptSearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {filteredItems: items}; // Inital state is the whole list of depts
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
                    label: 'Department',
                    required: true,
                })}
                {...this.props} //Pass down other props to the Downshift layer
            />
        );
    }
}

export default DeptSearchBar;
