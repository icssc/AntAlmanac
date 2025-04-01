import { IconButton, Theme, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Tune } from '@material-ui/icons';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import PPLogo from '$assets/peterportal-shortform-logo.svg'
import { FormEvent, useState, useEffect } from 'react';

import RightPaneStore from '../../RightPaneStore';

import FuzzySearch from './FuzzySearch';
import PrivacyPolicyBanner from './PrivacyPolicyBanner';
import TermSelector from './TermSelector';

import { HelpBox } from '$components/RightPane/CoursePane/SearchForm/HelpBox';
import { LegacySearch } from '$components/RightPane/CoursePane/SearchForm/LegacySearch';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { getLocalStorageHelpBoxDismissalTime, setLocalStorageHelpBoxDismissalTime } from '$lib/localStorage';
import { useCoursePaneStore } from '$stores/CoursePaneStore';

const styles: Styles<Theme, object> = {
    rightPane: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowX: 'hidden',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        gap: 16,
    },
    searchBar: {
        display: 'flex',
        flexDirection: 'row',
    },
    margin: {
        borderTop: 'solid 8px transparent',
        display: 'inline-flex',
    },
    form: {
        marginBottom: '20px',
        flexGrow: 2,
    },
    fallback: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};

const SearchForm = (props: { classes: ClassNameMap; toggleSearch: () => void }) => {
    const { classes, toggleSearch } = props;
    const { manualSearchEnabled, toggleManualSearch } = useCoursePaneStore();
    const [helpBoxVisibility, setHelpBoxVisibility] = useState(true);
    const [filterCourses, setFilterCourses] = useState(RightPaneStore.getFilterTakenClasses());

    const onFormSubmit = (event: FormEvent) => {
        event.preventDefault();
        toggleSearch();
    };

    useEffect(() => {
        const handleStoreUpdate = () => {
            setFilterCourses(RightPaneStore.getFilterTakenClasses());
        };

        RightPaneStore.on('formDataChange', handleStoreUpdate);

        return () => {
            RightPaneStore.off('formDataChange', handleStoreUpdate);
        };
    }, []);

    const toggleFilterCourses = () => {
        const newFilterState = !filterCourses;
        RightPaneStore.setFilterTakenClasses(newFilterState);
        setFilterCourses(newFilterState);
    };

    const currentMonthIndex = new Date().getMonth(); // 0=Jan
    // Active months: February/March for Spring planning, May/June for Fall planning, July/August for Summer planning,
    // and November/December for Winter planning
    const activeMonthIndices = [false, true, true, false, true, true, true, true, false, false, true, true];

    // Display the help box only if more than 30 days has passed since the last dismissal and
    // the current month is an active month
    const helpBoxDismissalTime = getLocalStorageHelpBoxDismissalTime();
    const dismissedRecently =
        helpBoxDismissalTime !== null && Date.now() - parseInt(helpBoxDismissalTime) < 30 * 24 * 3600 * 1000;
    const displayHelpBox = helpBoxVisibility && !dismissedRecently && activeMonthIndices[currentMonthIndex];

    const onHelpBoxDismiss = () => {
        setLocalStorageHelpBoxDismissalTime(Date.now().toString());
        setHelpBoxVisibility(false);
    };
    return (
        <div className={classes.rightPane}>
            <form onSubmit={onFormSubmit} className={classes.form}>
                <div className={classes.container}>
                    <div className={classes.margin}>
                        <TermSelector
                            changeTerm={(field: string, value: string) => RightPaneStore.updateFormValue(field, value)}
                            fieldName={'term'}
                        />
                        <Tooltip title="Toggle Manual Search">
                            <IconButton onClick={toggleManualSearch}>
                                <Tune />
                            </IconButton>
                        </Tooltip>
                    </div>

                    {!manualSearchEnabled ? (
                        <div className={classes.container}>
                            <div className={classes.searchBar} id="searchBar">
                                <FuzzySearch toggleSearch={toggleSearch} toggleShowLegacySearch={toggleManualSearch} />
                                <Tooltip arrow
                                    title={ <div style={{ fontSize: '0.8rem' }}> Filter Taken Courses <br/> (Data from PeterPortal.org) </div> }>
                                    <IconButton onClick={toggleFilterCourses} style={{ position: 'relative' }}>
                                        <img 
                                            src={PPLogo} 
                                            alt="Brand" 
                                            style={{ position: 'absolute', top: '60%', left: '5%', width: '35%', height: '35%' }} 
                                        />
                                        {filterCourses ? <FilterAltIcon /> : <FilterAltOffIcon />}
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                    ) : (
                        <LegacySearch
                            onSubmit={() => {
                                logAnalytics({
                                    category: analyticsEnum.classSearch.title,
                                    action: analyticsEnum.classSearch.actions.MANUAL_SEARCH,
                                });
                            }}
                            onReset={RightPaneStore.resetFormValues}
                        />
                    )}
                </div>
            </form>

            <HelpBox />
            <PrivacyPolicyBanner />
        </div>
    );
};

export default withStyles(styles)(SearchForm);
