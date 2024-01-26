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
import useCoursePaneStore from '$stores/CoursePaneStore';

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
    const { manualSearchEnabled, toggleManualSearch } = useCoursePaneStore();

    const onFormSubmit = (event: FormEvent) => {
        event.preventDefault();
        toggleSearch();
    };

    const currentMonthIndex = new Date().getMonth(); // 0=Jan
    const activeMonthIndices = [false, false, false, false, false, false, false, false, true, true, false, false];

    return (
        <div className={classes.rightPane}>
            <form onSubmit={onFormSubmit} className={classes.form}>
                <div className={classes.container}>
                    <div className={classes.margin}>
                        <TermSelector
                            changeState={(field: string, value: string) => RightPaneStore.updateFormValue(field, value)}
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

            {activeMonthIndices[currentMonthIndex] && <HelpBox />}
            <PrivacyPolicyBanner />
        </div>
    );
};

export default withStyles(styles)(SearchForm);
