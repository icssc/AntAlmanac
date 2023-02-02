import { ChangeEvent, PureComponent } from 'react';
import search, { SearchResult } from 'websoc-fuzzy-search';
import { Autocomplete, AutocompleteInputChangeReason, TextField } from '@mui/material';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import RightPaneStore from '../../RightPaneStore';

const emojiMap: Record<string, string> = {
    GE_CATEGORY: '🏫', // U+1F3EB :school:
    DEPARTMENT: '🏢', // U+1F3E2 :office:
    COURSE: '📚', // U+1F4DA :books:
    INSTRUCTOR: '🍎', // U+1F34E :apple:
};

const romanArr = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

interface FuzzySearchProps {
    toggleSearch: () => void;
    toggleShowLegacySearch: () => void;
}

interface FuzzySearchState {
    cache: Record<string, Record<string, SearchResult>>;
    open: boolean;
    results: Record<string, SearchResult>;
    value: string;
}

class FuzzySearch extends PureComponent<FuzzySearchProps, FuzzySearchState> {
    state: FuzzySearchState = {
        cache: {},
        open: false,
        results: {},
        value: '',
    };

    doSearch = (value: string) => {
        if (!value) return;
        const emoji = value.slice(0, 2);
        const ident: string[] = emoji === emojiMap.INSTRUCTOR ? [value.slice(3)] : value.slice(3).split(':');
        const term = RightPaneStore.getFormData().term;
        RightPaneStore.resetFormValues();
        RightPaneStore.updateFormValue('term', term);
        switch (emoji) {
            case emojiMap.GE_CATEGORY:
                RightPaneStore.updateFormValue(
                    'ge',
                    `GE-${ident[0].split(' ')[2].replace('(', '').replace(')', '').toUpperCase()}`
                );
                break;
            case emojiMap.DEPARTMENT:
                RightPaneStore.updateFormValue('deptValue', ident[0]);
                RightPaneStore.updateFormValue('deptLabel', ident.join(':'));
                break;
            case emojiMap.COURSE: {
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
                RightPaneStore.updateFormValue('deptValue', deptValue);
                RightPaneStore.updateFormValue('deptLabel', `${deptValue}: ${deptLabel}`);
                RightPaneStore.updateFormValue('courseNumber', ident[0].split(' ').slice(-1)[0]);
                break;
            }
            case emojiMap.INSTRUCTOR:
                RightPaneStore.updateFormValue(
                    'instructor',
                    Object.keys(this.state.results).filter((x) => this.state.results[x].name === ident[0])[0]
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

    filterOptions = (options: string[]) => options;

    getOptionLabel = (option: string) => {
        const object = this.state.results[option];
        if (!object) return option;
        switch (object.type) {
            case 'GE_CATEGORY': {
                const cat = option.split('-')[1].toLowerCase();
                const num = parseInt(cat);
                return `${emojiMap.GE_CATEGORY} GE ${cat.replace(num.toString(), romanArr[num - 1])} (${cat}): ${
                    object.name
                }`;
            }
            case 'DEPARTMENT':
                return `${emojiMap.DEPARTMENT} ${option}: ${object.name}`;
            case 'COURSE':
                // TODO: fix our `websoc-fuzzy-search` package to strongly type `object.metadata` correctly
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                return `${emojiMap.COURSE} ${object.metadata.department} ${object.metadata.number}: ${object.name}`;
            case 'INSTRUCTOR':
                return `${emojiMap.INSTRUCTOR} ${object.name}`;
            default:
                break;
        }
        return '';
    };

    getOptionSelected = () => true;

    onInputChange = (event: ChangeEvent<unknown>, value: string, reason: AutocompleteInputChangeReason) => {
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
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
