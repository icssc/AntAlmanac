import React, { Component } from 'react';
import depts from './depts.json';
import MuiDownshift from 'mui-downshift';

// TODO: Maps department codes to index value. Later, we will change this to map dept name to dept code, like {'Chemistry': 'CHEM'}
const items = depts.map((label, value) => ({ label, value }));

class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {filteredItems: items};
        this.handleStateChange = this.handleStateChange.bind(this);
    }

    handleStateChange(changes) {
        if (typeof changes.inputValue === 'string') {
            const filteredItems = items.filter(item => item.label.toLowerCase().includes(changes.inputValue.toLowerCase()));
            this.setState({ filteredItems });
        }
    };

    render() {
        const { filteredItems } = this.state;
        return (
            <MuiDownshift
                items={filteredItems}
                onStateChange={this.handleStateChange}
                {...this.props}
                getInputProps={() => ({
                        label: 'Department',
                        required: true,
                    })}
            />
        );
    }
}

export default SearchBar;