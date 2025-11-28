import { type AutocompleteInputChangeReason, Box } from '@mui/material';
import type { SearchResult } from '@packages/antalmanac-types';
import { PostHog } from 'posthog-js/react';
import { PureComponent } from 'react';
import { useThemeStore } from '$stores/SettingsStore';
import UAParser from 'ua-parser-js';


import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';

const SEARCH_TIMEOUT_MS = 150;

const emojiMap: Record<string, string> = {
    GE_CATEGORY: '🏫', // U+1F3EB :school:
    DEPARTMENT: '🏢', // U+1F3E2 :office:
    COURSE: '📚', // U+1F4DA :books:
    SECTION: '📝', // U+1F4DD :memo:
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
    toggleShowManualSearch: () => void;
    postHog?: PostHog;
}

interface FuzzySearchState {
    cache: Record<string, Record<string, SearchResult> | undefined>;
    open: boolean;
    results: Record<string, SearchResult> | undefined;
    value: string;
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
                break;
            case emojiMap.COURSE: {
                const deptValue = ident[0].split(' ').slice(0, -1).join(' ');
                RightPaneStore.updateFormValue('deptValue', deptValue);
                RightPaneStore.updateFormValue('courseNumber', ident[0].split(' ').slice(-1)[0]);
                break;
            }
            case emojiMap.SECTION: {
                RightPaneStore.updateFormValue('sectionCode', ident[0].split(' ')[0]);
                break;
            }
            default:
                break;
        }
        this.props.toggleSearch();
        logAnalytics(this.props.postHog, {
            category: analyticsEnum.classSearch,
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
            case 'SECTION':
                return `${emojiMap.SECTION} ${object.sectionCode} ${object.sectionType} ${object.sectionNum}: ${object.department} ${object.courseNumber}`;
            default:
                return '';
        }
    };

    requestIsCurrent = (requestTimestamp: number) => this.state.requestTimestamp === requestTimestamp;

    // Returns a function for use with setTimeout that exhibits the following behavior:
    // If the request is current, make the request. Then, if it is still current, update the component's
    // state to reflect the results of the query.
    maybeDoSearchFactory = (requestTimestamp: number) => () => {
        if (!this.requestIsCurrent(requestTimestamp)) return;
        trpc.search.doSearch
            .query({ query: this.state.value, term: RightPaneStore.getFormData().term })
            .then((result) => {
                if (!this.requestIsCurrent(requestTimestamp)) return;
                this.setState({
                    cache: {
                        ...this.state.cache,
                        [this.state.value]: result,
                    },
                    results: result,
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

    // Renders each autocomplete option as a custom list item. Shows availability status if item is a course.
    renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: string) => {
        const object = this.state.results?.[option];
        if (!object) return <li {...props}>{option}</li>;

        const label = this.getOptionLabel(option);
        const isCourse = object.type === 'COURSE';

        const isOffered = isCourse && 'isOffered' in object && object.isOffered;
        const isDark = useThemeStore.getState().isDark;
        const mobile = isMobile();

        return (
            <Box
                component="li"
                {...props}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    opacity: isCourse && !isOffered ? 0.6 : 1,
                }}
            >
                {label}
                {isCourse && !mobile && (
                    <Box
                        component="span"
                        sx={{
                            marginLeft: 'auto',
                            color: isOffered 
                                ? (isDark ? '#a6e3a1' : '#40a02b') 
                                : (isDark ? '#f38ba8': '#d20f39'),
                            fontWeight: 500,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '.MuiAutocomplete-option:hover &': {
                                opacity: 1,
                            },
                        }}
                    >
                        {isOffered ? 'Offered' : 'Not Offered'}
                    </Box>
                )}
            </Box>
        )
    }

    render() {
        return (
            <LabeledAutocomplete
                label="Search"
                autocompleteProps={{
                    loading: this.state.loading,
                    fullWidth: true,
                    options: Object.keys(this.state.results ?? {}),
                    autoHighlight: true,
                    filterOptions: this.filterOptions,
                    getOptionLabel: this.getOptionLabel,
                    renderOption: this.renderOption,
                    id: 'fuzzy-search',
                    noOptionsText: 'No results found! Please try broadening your search.',
                    onClose: this.onClose,
                    onInputChange: this.onInputChange,
                    open: this.state.open,
                    popupIcon: '',
                }}
                textFieldProps={{
                    autoFocus: !isMobile(),
                    placeholder: 'Search for courses, departments, GEs...',
                    fullWidth: true,
                }}
                isAligned
            />
        );
    }
}

export default FuzzySearch;
