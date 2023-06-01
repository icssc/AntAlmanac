import { IconButton, Theme, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Tune } from '@material-ui/icons';
import { FormEvent, useState } from 'react';

import RightPaneStore from '../../RightPaneStore';
import FuzzySearch from './FuzzySearch';
import HelpBox from './HelpBox';
import LegacySearch from './LegacySearch';
import PrivacyPolicyBanner from './PrivacyPolicyBanner';
import TermSelector from './TermSelector';
import analyticsEnum, { logAnalytics } from '$lib/analytics';

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

    const search = new URLSearchParams(window.location.search);

    const [showLegacySearch, setShowLegacySearch] = useState(
        Boolean(
            search.get('courseCode') ||
                search.get('courseNumber') ||
                search.get('deptLabel') ||
                search.get('GE') ||
                search.get('deptValue') ||
                search.get('term')
        )
    );

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

            {/*(currentMonth === 8 || currentMonth === 9) &&*/ <HelpBox />}
            <PrivacyPolicyBanner />
        </div>
    );
};

export default withStyles(styles)(SearchForm);
