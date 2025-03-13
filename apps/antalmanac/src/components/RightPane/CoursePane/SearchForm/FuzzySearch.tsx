import TextField from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteInputChangeReason } from '@material-ui/lab/Autocomplete';
import type { SearchResult } from '@packages/antalmanac-types';
import { PureComponent } from 'react';
import UAParser from 'ua-parser-js';

import RightPaneStore from '../../RightPaneStore';

import analyticsEnum, { logAnalytics } from '$lib/analytics';
import trpc from '$lib/api/trpc';

const SEARCH_TIMEOUT_MS = 150;

const emojiMap: Record<string, string> = {
    GE_CATEGORY: '🏫', // U+1F3EB :school:
    DEPARTMENT: '🏢', // U+1F3E2 :office:
    COURSE: '📚', // U+1F4DA :books:
};

const romanArr = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const isMobile = () => {
    const parser = new UAParser();
    return parser.getDevice().type === 'mobile' || parser.getDevice().type === 'tablet' || isIpad();
};

const isIpad = () => {
    return navigator.userAgent.includes('Mac') && 'ontouchend' in document;
};

interface FuzzySearchProps {
    toggleSearch: () => void;
    toggleShowLegacySearch: () => void;
}

interface FuzzySearchState {
    cache: Record<string, Record<string, SearchResult> | undefined>;
    open: boolean;
    results: Record<string, SearchResult> | undefined;
    value: string;
    userID: string;
    loading: boolean;
    requestTimestamp?: number;
    pendingRequest?: number;
}

class FuzzySearch extends PureComponent<FuzzySearchProps, FuzzySearchState> {
    state: FuzzySearchState = {
        cache: {},
        open: false,
        results: {},
        value: '',
        userID: RightPaneStore.getUserID(),
        loading: false,
        requestTimestamp: undefined,
        pendingRequest: undefined,
    };

    doSearch = (value: string) => {
        if (!value) return;
        const emoji = value.slice(0, 2);
        const ident = value.slice(3).split(':');
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
                RightPaneStore.updateFormValue('deptValue', deptValue);
                RightPaneStore.updateFormValue('deptLabel', deptValue);
                RightPaneStore.updateFormValue('courseNumber', ident[0].split(' ').slice(-1)[0]);
                break;
            }
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
        const object = this.state.results?.[option];
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
                return `${emojiMap.COURSE} ${object.metadata.department} ${object.metadata.number}: ${object.name}`;
            default:
                return '';
        }
    };

    getOptionSelected = () => true;

    requestIsCurrent = (requestTimestamp: number) => this.state.requestTimestamp === requestTimestamp;

    // Returns a function for use with setTimeout that exhibits the following behavior:
    // If the request is current, make the request. Then, if it is still current, update the component's
    // state to reflect the results of the query.
    maybeDoSearchFactory = (requestTimestamp: number) => () => {
        if (!this.requestIsCurrent(requestTimestamp)) return;
        trpc.search.doSearch
            .query({ 
                query: this.state.value,
            })
            .then(async (result) => {
                if (!this.requestIsCurrent(requestTimestamp)) return;

                let userTakenCourses: Set<string> = new Set();
                let filteredResults = result;

                if (RightPaneStore.getFilterTakenClasses()) {
                    userTakenCourses = new Set<string>(await trpc.search.fetchUserCoursesPeterPortal.query({ userId: this.state.userID }));
                    RightPaneStore.setUserTakenCourses(userTakenCourses);

                    filteredResults = Object.fromEntries(
                        Object.entries(result).filter(([id]) => 
                            !RightPaneStore.getUserTakenCourses().has(id)
                        )
                    );
                }

                this.setState({
                    cache: {
                        ...this.state.cache,
                        [this.state.value]: filteredResults,
                    },
                    results: filteredResults,
                    loading: false,
                    pendingRequest: undefined,
                    requestTimestamp: undefined,
                });
            })
            .catch((e) => {
                if (!this.requestIsCurrent(requestTimestamp)) return;
                this.setState({ results: {}, loading: false });
                console.error(e);
            });
    };

    fetchUserTakenCourses = async () => {
        try {
            const userTakenCourses = await trpc.search.fetchUserCoursesPeterPortal.query({ userId: this.state.userID });
            return new Set(userTakenCourses);
        } catch (error) {
            console.error("Error fetching user courses from PeterPortal:", error);
            return new Set();
        }
    };

    onInputChange = (_event: unknown, value: string, reason: AutocompleteInputChangeReason) => {
        const lowerCaseValue = value.toLowerCase();
        if (reason === 'input') {
            this.setState(
                {
                    open: lowerCaseValue.length >= 2,
                    value: lowerCaseValue.slice(-1) === ' ' ? lowerCaseValue.slice(0, -1) : lowerCaseValue,
                },
                () => {
                    if (lowerCaseValue.length < 2) return;
                    if (this.state.cache[this.state.value]) {
                        this.setState({ results: this.state.cache[this.state.value] });
                    } else {
                        const requestTimestamp = Date.now();
                        this.setState({ results: {}, loading: true, requestTimestamp }, () => {
                            window.clearTimeout(this.state.pendingRequest);
                            const pendingRequest = window.setTimeout(
                                this.maybeDoSearchFactory(requestTimestamp),
                                SEARCH_TIMEOUT_MS
                            );
                            this.setState({ pendingRequest });
                        });
                    }
                }
            );
        } else if (reason === 'reset') {
            this.setState({ open: false, value: '' }, () => {
                this.doSearch(lowerCaseValue);
            });
        }
    };

    onClose = () => {
        this.setState({ open: false });
    };

    render() {
        return (
            <Autocomplete
                loading={this.state.loading}
                style={{ width: '100%' }}
                options={Object.keys(this.state.results ?? {})}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        inputRef={(input: HTMLInputElement | null) => {
                            if (input && !isMobile()) {
                                input.focus();
                            }
                        }}
                        fullWidth
                        label={'Search'}
                        placeholder="Search for courses, departments, GEs..."
                    />
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
