import React, { PureComponent } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import search from 'websoc-fuzzy-search';
import { updateFormValue, resetFormValues } from '../../actions/RightPaneActions';

const emojiMap = {
    GE_CATEGORY: '🏫', // U+1F3EB :school:
    DEPARTMENT: '🏢', // U+1F3E2 :office:
    COURSE: '📚', // U+1F4DA :books:
    INSTRUCTOR: '🧑', // U+1F9D1 :adult:
};

const romanArr = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

class FuzzySearch extends PureComponent {
    state = {
        cache: {},
        open: false,
        results: {},
        value: '',
    };

    filterOptions = (options) => options;

    getOptionLabel = (option) => {
        const object = this.state.results[option];
        if (!object) return option;
        if (object.type === 'GE_CATEGORY') {
            const cat = option.split('-')[1];
            const num = parseInt(cat);
            return `${emojiMap.GE_CATEGORY} GE ${cat.replace(num.toString(), romanArr[num - 1])} (${cat}): ${
                object.name
            }`;
        } else if (object.type === 'DEPARTMENT') {
            return `${emojiMap.DEPARTMENT} ${option}: ${object.name}`;
        } else if (object.type === 'COURSE') {
            return `${emojiMap.COURSE} ${object.metadata.department} ${object.metadata.number}: ${object.name}`;
        } else if (object.type === 'INSTRUCTOR') {
            return `${emojiMap.INSTRUCTOR} ${object.name}`;
        }
    };

    getOptionSelected = () => true;

    onInputChange = (event, value, reason) => {
        if (reason === 'input') {
            this.setState({ open: value.length >= 2, value: value }, () => {
                if (this.state.value.split(' ').some((x) => x.length < 2)) {
                    this.setState({ results: {} });
                } else {
                    if (this.state.cache[this.state.value]) {
                        this.setState({ results: this.state.cache[this.state.value] });
                    } else {
                        try {
                            const result = search(this.state.value);
                            this.setState({
                                cache: { ...this.state.cache, [this.state.value]: result },
                                results: result,
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            });
        } else if (reason === 'reset') {
            this.setState({ open: false, value: '' }, () => {
                const emoji = value.slice(0, 2);
                const ident = emoji === emojiMap.INSTRUCTOR ? value.slice(3) : value.slice(3).split(':')[0];
                resetFormValues();
                if (emoji === emojiMap.GE_CATEGORY) {
                    updateFormValue('ge', `GE-${ident.split(' ')[2].replace('(', '').replace(')', '')}`);
                } else if (emoji === emojiMap.DEPARTMENT) {
                    updateFormValue('deptValue', ident);
                } else if (emoji === emojiMap.COURSE) {
                    updateFormValue('deptValue', ident.split(' ').slice(0, -1).join(' '));
                    updateFormValue('courseNumber', ident.split(' ').slice(-1)[0]);
                } else if (emoji === emojiMap.INSTRUCTOR) {
                    updateFormValue(
                        'instructor',
                        Object.keys(this.state.results).filter((x) => this.state.results[x].name === ident)
                    );
                }
                this.props.toggleSearch();
            });
        }
    };

    onClose = () => {
        this.setState({ open: false });
    };

    render() {
        return (
            <Autocomplete
                options={Object.keys(this.state.results)}
                renderInput={(params) => <TextField {...params} fullWidth label={'Search'} />}
                filterOptions={this.filterOptions}
                getOptionLabel={this.getOptionLabel}
                getOptionSelected={this.getOptionSelected}
                id={'fuzzy-search'}
                noOptionsText={'No results found! Please try broadening your search.'}
                onClose={this.onClose}
                onInputChange={this.onInputChange}
                open={this.state.open}
                popupIcon={''}
            />
        );
    }
}

export default FuzzySearch;
