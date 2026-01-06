import { type AutocompleteInputChangeReason, Box, Divider, Typography } from '@mui/material';
import type { SearchResult } from '@packages/antalmanac-types';
import { PostHog } from 'posthog-js/react';
import { PureComponent } from 'react';
import UAParser from 'ua-parser-js';

import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';

const SEARCH_TIMEOUT_MS = 150;

const resultType = {
    GE_CATEGORY: 'GE_CATEGORY',
    DEPARTMENT: 'DEPARTMENT',
    COURSE: 'COURSE',
    SECTION: 'SECTION',
} as const;

const groupType = {
    UNGROUPED: '__ungrgouped__',
    NOT_OFFERED: '__notOffered__',
    OFFERED: '__offered__',
} as const;

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
    currentTerm: string;
}

interface SearchOption {
    key: string;
    result: SearchResult;
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
        currentTerm: RightPaneStore.getFormData().term,
    };

    componentDidMount() {
        RightPaneStore.on('formDataChange', this.handleFormDataChange);
    }

    componentWillUnmount() {
        RightPaneStore.off('formDataChange', this.handleFormDataChange);
    }

    private getCacheKey = (term: string, query: string): string => {
        return `${term}:${query}`;
    };

    handleFormDataChange = () => {
        const newTerm = RightPaneStore.getFormData().term;

        if (newTerm !== this.state.currentTerm && this.state.value.length >= 2) {
            const cacheKey = this.getCacheKey(newTerm, this.state.value);

            if (this.state.cache[cacheKey]) {
                this.setState({
                    currentTerm: newTerm,
                    results: this.state.cache[cacheKey],
                    open: false,
                });
            } else {
                const requestTimestamp = Date.now();

                this.setState(
                    {
                        currentTerm: newTerm,
                        results: {},
                        loading: true,
                        requestTimestamp,
                        open: false,
                    },
                    () => {
                        window.clearTimeout(this.state.pendingRequest);
                        this.maybeDoSearchFactory(requestTimestamp)();
                    }
                );
            }
        } else if (newTerm !== this.state.currentTerm) {
            this.setState({ currentTerm: newTerm });
        }
    };

    doSearch = (option: SearchOption) => {
        const result = option.result;
        if (!result) {
            return;
        }
        const term = RightPaneStore.getFormData().term;
        RightPaneStore.resetFormValues();
        RightPaneStore.updateFormValue('term', term);
        switch (result.type) {
            case resultType.GE_CATEGORY: {
                const geCode = option.key.split('-')[1].toUpperCase();
                RightPaneStore.updateFormValue('ge', `GE-${geCode}`);
                break;
            }
            case resultType.DEPARTMENT:
                RightPaneStore.updateFormValue('deptValue', option.key);
                break;
            case resultType.COURSE: {
                const { department, number } = result.metadata;
                RightPaneStore.updateFormValue('deptValue', department);
                RightPaneStore.updateFormValue('courseNumber', number);
                break;
            }
            case resultType.SECTION: {
                RightPaneStore.updateFormValue('sectionCode', result.sectionCode);
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

    filterOptions = (options: SearchOption[]) => options;

    getOptionLabel = (option: SearchOption) => {
        const object = option.result;
        if (!object) return option.key;
        switch (object.type) {
            case resultType.GE_CATEGORY: {
                const cat = option.key.split('-')[1].toLowerCase();
                const num = parseInt(cat);
                return `${emojiMap.GE_CATEGORY} GE ${cat.replace(num.toString(), romanArr[num - 1])} (${cat}): ${
                    object.name
                }`;
            }
            case resultType.DEPARTMENT:
                return `${emojiMap.DEPARTMENT} ${option.key}: ${object.name}`;
            case resultType.COURSE:
                return `${emojiMap.COURSE} ${object.metadata.department} ${object.metadata.number}: ${object.name}`;
            case resultType.SECTION:
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

        const requestTerm = RightPaneStore.getFormData().term;
        const requestQuery = this.state.value;

        trpc.search.doSearch
            .query({ query: requestQuery, term: requestTerm })
            .then((result) => {
                if (!this.requestIsCurrent(requestTimestamp)) return;

                const cacheKey = this.getCacheKey(requestTerm, requestQuery);

                this.setState({
                    cache: {
                        ...this.state.cache,
                        [cacheKey]: result,
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

                    const cacheKey = this.getCacheKey(this.state.currentTerm, this.state.value);

                    if (this.state.cache[cacheKey]) {
                        this.setState({ results: this.state.cache[cacheKey] });
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
        }
    };

    onChange = (_event: unknown, option: SearchOption | null) => {
        if (option) {
            this.setState({ open: false, value: '' }, () => {
                this.doSearch(option);
            });
        }
    };

    onClose = () => {
        this.setState({ open: false });
    };

    groupBy = (option: SearchOption) => {
        const isCourse = option.result.type === resultType.COURSE;
        if (!isCourse) return groupType.UNGROUPED;

        const isOffered = 'isOffered' in option.result && option.result.isOffered;
        return isOffered ? groupType.OFFERED : groupType.NOT_OFFERED;
    };

    renderGroup = (params: { key: string; group: string; children?: React.ReactNode }) => {
        if (params.group === groupType.UNGROUPED) {
            return <Box key={params.key}>{params.children}</Box>;
        }

        const term = RightPaneStore.getFormData().term;
        const label = params.group === groupType.OFFERED ? `Offered in ${term}` : `Not Offered`;

        return (
            <Box key={params.key}>
                <Divider
                    textAlign="left"
                    sx={{
                        mt: 1,
                        mb: 1,
                        ml: 0.5,
                        '&::before': { width: '0px' },
                        '&::after': { borderColor: 'text.primary', opacity: 0.45 },
                    }}
                >
                    <Typography variant="subtitle1">{label}</Typography>
                </Divider>
                {params.children}
            </Box>
        );
    };

    renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: SearchOption) => {
        const object = option.result;
        const { key, ...restProps } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
        if (!object) {
            return (
                <Box component="li" key={key} {...restProps}>
                    {option.key}
                </Box>
            );
        }

        const label = this.getOptionLabel(option);
        const isCourse = object.type === resultType.COURSE;

        const isOffered = isCourse && 'isOffered' in object && object.isOffered;

        return (
            <Box
                component="li"
                key={key}
                {...restProps}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    opacity: isCourse && !isOffered ? 0.6 : 1,
                }}
            >
                {label}
            </Box>
        );
    };

    onFocus = () => {
        if (this.state.value.length >= 2) {
            this.setState({ open: true });
        }
    };

    render() {
        return (
            <LabeledAutocomplete
                label="Search"
                autocompleteProps={{
                    loading: this.state.loading,
                    fullWidth: true,
                    options: Object.entries(this.state.results ?? {}).map(([key, result]) => ({ key, result })),
                    autoHighlight: true,
                    filterOptions: this.filterOptions,
                    getOptionLabel: this.getOptionLabel,
                    renderOption: this.renderOption,
                    groupBy: this.groupBy,
                    renderGroup: this.renderGroup,
                    onChange: this.onChange,
                    id: 'fuzzy-search',
                    noOptionsText: 'No results found! Please try broadening your search.',
                    onClose: this.onClose,
                    onInputChange: this.onInputChange,
                    open: this.state.open,
                    popupIcon: '',
                    clearOnBlur: false,
                }}
                textFieldProps={{
                    autoFocus: !isMobile(),
                    placeholder: 'Search for courses, departments, GEs...',
                    fullWidth: true,
                    onFocus: this.onFocus,
                }}
                isAligned
            />
        );
    }
}

export default FuzzySearch;
