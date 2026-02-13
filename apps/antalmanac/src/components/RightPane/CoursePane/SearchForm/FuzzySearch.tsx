import {
    type AutocompleteInputChangeReason,
    type AutocompleteRenderGroupParams,
    Box,
    Divider,
    Typography,
} from '@mui/material';
import type { SearchResult } from '@packages/antalmanac-types';
import { PostHog } from 'posthog-js/react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
    postHog?: PostHog;
}

interface SearchOption {
    key: string;
    result: SearchResult;
}

const FuzzySearch = ({ toggleSearch, postHog }: FuzzySearchProps) => {
    const [cache, setCache] = useState<Record<string, Record<string, SearchResult> | undefined>>({});
    const [open, setOpen] = useState<boolean>(false);
    const [results, setResults] = useState<Record<string, SearchResult> | undefined>({});
    const [value, setValue] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [pendingRequest, setPendingRequest] = useState<number | undefined>(undefined);
    const [currentTerm, setCurrentTerm] = useState<string>(RightPaneStore.getFormData().term);

    const requestTimestampRef = useRef<number | undefined>(undefined);

    const getCacheKey = (term: string, query: string): string => {
        return `${term}:${query}`;
    };

    const doSearch = (option: SearchOption) => {
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
        toggleSearch();
        logAnalytics(postHog, {
            category: analyticsEnum.classSearch,
            action: analyticsEnum.classSearch.actions.FUZZY_SEARCH,
        });
    };

    const filterOptions = (options: SearchOption[]) => options;

    const getOptionLabel = (option: SearchOption) => {
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

    const requestIsCurrent = useCallback(
        (requestTimestamp: number) => requestTimestampRef.current === requestTimestamp,
        []
    );

    // Returns a function for use with setTimeout that exhibits the following behavior:
    // If the request is current, make the request. Then, if it is still current, update the component's
    // state to reflect the results of the query.
    const maybeDoSearchFactory = useCallback(
        (requestTimestamp: number, requestQuery: string) => () => {
            if (!requestIsCurrent(requestTimestamp)) return;

            const requestTerm = RightPaneStore.getFormData().term;

            trpc.search.doSearch
                .query({ query: requestQuery, term: requestTerm })
                .then((result) => {
                    if (!requestIsCurrent(requestTimestamp)) return;

                    const cacheKey = getCacheKey(requestTerm, requestQuery);

                    setCache((cache) => ({
                        ...cache,
                        [cacheKey]: result,
                    }));
                    setResults(result);
                    setLoading(false);
                    setPendingRequest(undefined);
                    requestTimestampRef.current = undefined;
                })
                .catch((e) => {
                    if (!requestIsCurrent(requestTimestamp)) return;
                    setResults({});
                    setLoading(false);
                    console.error(e);
                });
        },
        [requestIsCurrent]
    );

    const handleFormDataChange = useCallback(() => {
        const newTerm = RightPaneStore.getFormData().term;

        if (newTerm !== currentTerm && value.length >= 2) {
            const cacheKey = getCacheKey(newTerm, value);

            if (cache[cacheKey]) {
                setCurrentTerm(newTerm);
                setResults(cache[cacheKey]);
                setOpen(false);
            } else {
                const requestTimestamp = Date.now();

                setCurrentTerm(newTerm);
                setResults({});
                setLoading(true);
                requestTimestampRef.current = requestTimestamp;
                setOpen(false);

                window.clearTimeout(pendingRequest);
                maybeDoSearchFactory(requestTimestamp, value)();
            }
        } else if (newTerm !== currentTerm) {
            setCurrentTerm(newTerm);
        }
    }, [cache, currentTerm, value, maybeDoSearchFactory, pendingRequest]);

    const onInputChange = (_event: unknown, inputValue: string, reason: AutocompleteInputChangeReason) => {
        const lowerCaseValue = inputValue.toLowerCase();
        if (reason === 'input') {
            const newValue = lowerCaseValue.slice(-1) === ' ' ? lowerCaseValue.slice(0, -1) : lowerCaseValue;

            setOpen(lowerCaseValue.length >= 2);
            setValue(newValue);

            if (lowerCaseValue.length >= 2) {
                const cacheKey = getCacheKey(currentTerm, newValue);

                if (cache[cacheKey]) {
                    setResults(cache[cacheKey]);
                } else {
                    const requestTimestamp = Date.now();

                    setResults({});
                    setLoading(true);
                    requestTimestampRef.current = requestTimestamp;

                    window.clearTimeout(pendingRequest);
                    const newPendingRequest = window.setTimeout(
                        maybeDoSearchFactory(requestTimestamp, newValue),
                        SEARCH_TIMEOUT_MS
                    );
                    setPendingRequest(newPendingRequest);
                }
            }
        }
    };

    const onChange = (_event: unknown, option: SearchOption | null) => {
        if (option) {
            setOpen(false);
            setValue('');

            doSearch(option);
        }
    };

    const onClose = () => {
        setOpen(false);
    };

    const groupBy = (option: SearchOption) => {
        const isCourse = option.result.type === resultType.COURSE;
        if (!isCourse) return groupType.UNGROUPED;

        const isOffered = 'isOffered' in option.result && option.result.isOffered;
        return isOffered ? groupType.OFFERED : groupType.NOT_OFFERED;
    };

    const renderGroup = (params: AutocompleteRenderGroupParams) => {
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

    const renderOption = (
        componentProps: React.HTMLAttributes<HTMLLIElement> & { key: string },
        option: SearchOption
    ) => {
        const object = option.result;
        const { key, ...restProps } = componentProps;
        if (!object)
            return (
                <Box component="li" key={key} {...restProps}>
                    {option.key}
                </Box>
            );

        const label = getOptionLabel(option);
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

    const onFocus = () => {
        if (value.length >= 2) {
            setOpen(true);
        }
    };

    useEffect(() => {
        RightPaneStore.on('formDataChange', handleFormDataChange);

        return () => {
            RightPaneStore.off('formDataChange', handleFormDataChange);
        };
    }, [handleFormDataChange]);

    return (
        <LabeledAutocomplete
            label="Search"
            autocompleteProps={{
                loading: loading,
                fullWidth: true,
                options: Object.entries(results ?? {}).map(([key, result]) => ({ key, result })),
                autoHighlight: true,
                filterOptions: filterOptions,
                getOptionLabel: getOptionLabel,
                renderOption: renderOption,
                groupBy: groupBy,
                renderGroup: renderGroup,
                onChange: onChange,
                id: 'fuzzy-search',
                noOptionsText: 'No results found! Please try broadening your search.',
                onClose: onClose,
                onInputChange: onInputChange,
                open: open,
                popupIcon: '',
                clearOnBlur: false,
            }}
            textFieldProps={{
                autoFocus: !isMobile(),
                placeholder: 'Search for courses, departments, GEs...',
                fullWidth: true,
                onFocus: onFocus,
            }}
            isAligned
        />
    );
};

export default FuzzySearch;
