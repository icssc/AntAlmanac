import { IconButton, Theme, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Tune } from '@material-ui/icons';
import { FormEvent, useState } from 'react';

import analyticsEnum, { logAnalytics } from '$lib/analytics';

import RightPaneStore from '../../RightPaneStore';
import FuzzySearch from './FuzzySearch';
import HelpBox from './HelpBox';
import LegacySearch from './LegacySearch';
import PrivacyPolicyBanner from './PrivacyPolicyBanner';
import TermSelector from './TermSelector';

const styles: Styles<Theme, object> = {
    rightPane: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    searchBar: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: '1rem',
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

    const urlParamValue1 = new URLSearchParams(window.location.search).get("courseCode") != "" && 
                            new URLSearchParams(window.location.search).get("courseCode") != null;
    const urlParamValue2 = new URLSearchParams(window.location.search).get("courseNumber") != "" && 
                            new URLSearchParams(window.location.search).get("courseNumber") != null;
    const urlParamValue3 = new URLSearchParams(window.location.search).get("deptLabel") != "" && 
                            new URLSearchParams(window.location.search).get("deptLabel") != null;
    const urlParamValue4 = new URLSearchParams(window.location.search).get("deptValue") != "" && 
                            new URLSearchParams(window.location.search).get("deptValue") != null;
    const urlParamValue5 = new URLSearchParams(window.location.search).get("GE") != "" && 
                            new URLSearchParams(window.location.search).get("GE") != null;
    const urlParamValue6 = new URLSearchParams(window.location.search).get("term") != "" && 
                            new URLSearchParams(window.location.search).get("term") != null;
    const [showLegacySearch, setShowLegacySearch] = useState(urlParamValue1 == true || 
                                urlParamValue2 == true || urlParamValue3 == true || 
                                urlParamValue4 == true || urlParamValue5 || 
                                urlParamValue6 == true == true ? true : false);

    const toggleShowLegacySearch = () => {
        setShowLegacySearch(!showLegacySearch);
    };

    const onFormSubmit = (event: FormEvent) => {
        event.preventDefault();
        toggleSearch();
    };

    const currentMonth = new Date().getMonth(); // 0=Jan

    return (
        <div className={classes.rightPane}>
            <form onSubmit={onFormSubmit} className={classes.form}>
                <div className={classes.container}>
                    <div className={classes.margin}>
                        <TermSelector
                            changeState={(field: string, value: string) => RightPaneStore.updateFormValue(field, value)}
                            fieldName={'term'}
                        />
                    </div>

                    <div className={classes.container}>
                        <div className={classes.searchBar}>
                            <FuzzySearch toggleSearch={toggleSearch} toggleShowLegacySearch={toggleShowLegacySearch} />
                            <Tooltip title="Manual Search">
                                <IconButton onClick={toggleShowLegacySearch}>
                                    <Tune />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>

                    {showLegacySearch && (
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

            {(currentMonth === 8 || currentMonth === 9) && <HelpBox />}
            <PrivacyPolicyBanner />
        </div>
    );
};

export default withStyles(styles)(SearchForm);
