import React, { PureComponent } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import search from 'websoc-fuzzy-search';
import { updateFormValue, resetFormValues } from '../../../../actions/RightPaneActions';
import RightPaneStore from '../../../../stores/RightPaneStore';
import analyticsEnum, { logAnalytics } from '../../../../analytics';

const emojiMap = {
    GE_CATEGORY: '🏫', // U+1F3EB :school:
    DEPARTMENT: '🏢', // U+1F3E2 :office:
    COURSE: '📚', // U+1F4DA :books:
    INSTRUCTOR: '🍎', // U+1F34E :apple:
};

const romanArr = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

class FuzzySearch extends PureComponent {
    state = {
        cache: {},
        open: false,
        results: {},
        value: '',
    };

    doSearch = (value) => {
        if (!value) return;
        const emoji = value.slice(0, 2);
        const ident = emoji === emojiMap.INSTRUCTOR ? value.slice(3) : value.slice(3).split(':');
        const term = RightPaneStore.getFormData().term;
        resetFormValues();
        updateFormValue('term', term);
        switch (emoji) {
            case emojiMap.GE_CATEGORY:
                updateFormValue('ge', `GE-${ident[0].split(' ')[2].replace('(', '').replace(')', '').toUpperCase()}`);
                break;
            case emojiMap.DEPARTMENT:
                updateFormValue('deptValue', ident[0]);
                updateFormValue('deptLabel', ident.join(':'));
                break;
            case emojiMap.COURSE:
                const deptValue = ident[0].split(' ').slice(0, -1).join(' ');
                let deptLabel;
                for (const [key, value] of Object.entries(this.state.cache)) {
                    if (Object.keys(value).includes(deptValue)) {
                        deptLabel = this.state.cache[key][deptValue].name;
                        break;
                    }
                }
                if (!deptLabel) {
                    const deptSearch = search({ query: deptValue.toLowerCase(), numResults: 1 });
                    deptLabel = deptSearch[deptValue].name;
                    this.setState({
                        cache: {
                            ...this.state.cache,
                            [deptValue.toLowerCase()]: deptSearch,
                        },
                    });
                }
                updateFormValue('deptValue', deptValue);
                updateFormValue('deptLabel', `${deptValue}: ${deptLabel}`);
                updateFormValue('courseNumber', ident[0].split(' ').slice(-1)[0]);
                break;
            case emojiMap.INSTRUCTOR:
                updateFormValue(
                    'instructor',
                    Object.keys(this.state.results).filter((x) => this.state.results[x].name === ident)[0]
                );
                break;
            default:
                break;
        }
        this.props.toggleSearch();
        logAnalytics({
            category: analyticsEnum.classSearch.title,
            action: analyticsEnum.classSearch.actions.FUZZY_SEARCH,
        });
    };

    filterOptions = (options) => options;

    getOptionLabel = (option) => {
        const object = this.state.results[option];
        if (!object) return option;
        switch (object.type) {
            case 'GE_CATEGORY':
                const cat = option.split('-')[1].toLowerCase();
                const num = parseInt(cat);
                return `${emojiMap.GE_CATEGORY} GE ${cat.replace(num.toString(), romanArr[num - 1])} (${cat}): ${
                    object.name
                }`;
            case 'DEPARTMENT':
                return `${emojiMap.DEPARTMENT} ${option}: ${object.name}`;
            case 'COURSE':
                return `${emojiMap.COURSE} ${object.metadata.department} ${object.metadata.number}: ${object.name}`;
            case 'INSTRUCTOR':
                return `${emojiMap.INSTRUCTOR} ${object.name}`;
            default:
                break;
        }
    };

    getOptionSelected = () => true;

    onInputChange = (event, value, reason) => {
        if (reason === 'input') {
            this.setState(
                { open: value.length >= 2, value: value.slice(-1) === ' ' ? value.slice(0, -1) : value },
                () => {
                    if (value.length < 2) return;
                    if (this.state.cache[this.state.value]) {
                        this.setState({ results: this.state.cache[this.state.value] });
                    } else {
                        try {
                            const result = search({ query: this.state.value, numResults: 10 });
                            this.setState({
                                cache: { ...this.state.cache, [this.state.value]: result },
                                results: result,
                            });
                        } catch (e) {
                            this.setState({ results: {} });
                            console.error(e);
                        }
                    }
                }
            );
        } else if (reason === 'reset') {
            this.setState({ open: false, value: '' }, () => {
                this.doSearch(value);
            });
        }
    };

    onClose = () => {
        this.setState({ open: false });
    };

    render() {
        return (
            <Autocomplete
                style={{ width: '100%' }}
                options={Object.keys(this.state.results)}
                renderInput={(params) => (
                    <TextField {...params} inputRef={(input) => input} fullWidth label={'Search'} />
                )}
                autoHighlight={true}
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
