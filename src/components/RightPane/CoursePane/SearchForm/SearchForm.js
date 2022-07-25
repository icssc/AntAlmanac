import React, { useState } from 'react';
import TermSelector from './TermSelector';
import { withStyles } from '@material-ui/core/styles';
import PrivacyPolicyBanner from './PrivacyPolicyBanner';
import RightPaneStore from '../../RightPaneStore';
import FuzzySearch from './FuzzySearch';
import LegacySearch from './LegacySearch';
import { IconButton, Tooltip } from '@material-ui/core';
import { Tune } from '@material-ui/icons';
import analyticsEnum, { logAnalytics } from '../../../../analytics';
import HelpBox from './HelpBox';

const styles = {
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

const SearchForm = (props) => {
    const { classes, toggleSearch } = props;

    const [showLegacySearch, setShowLegacySearch] = useState(false);

    const toggleShowLegacySearch = () => {
        setShowLegacySearch(!showLegacySearch);
    };

    const onFormSubmit = (event) => {
        event.preventDefault();
        toggleSearch();
    };

    return (
        <div className={classes.rightPane}>
            <form onSubmit={onFormSubmit} className={classes.form}>
                <div className={classes.container}>
                    <div className={classes.margin}>
                        <TermSelector changeState={RightPaneStore.updateFormValue} fieldName={'term'} />
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
                                toggleSearch();
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
