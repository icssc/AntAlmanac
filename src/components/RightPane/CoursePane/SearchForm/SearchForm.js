import React, { useState } from 'react';
import TermSelector from './TermSelector';
import { withStyles } from '@material-ui/core/styles';
import PrivacyPolicyBanner from './PrivacyPolicyBanner';
import { updateFormValue, resetFormValues } from '../../../../actions/RightPaneActions';
import FuzzySearch from './FuzzySearch';
import LegacySearch from './LegacySearch';
import { IconButton, Tooltip } from '@material-ui/core';
import { Tune } from '@material-ui/icons';
import analyticsEnum, { logAnalytics } from '../../../../analytics';

const styles = {
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
        minHeight: 'calc(100% - 120px)',
        marginBottom: '20px',
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
        <>
            <form onSubmit={onFormSubmit} className={classes.form}>
                <div className={classes.container}>
                    <div className={classes.margin}>
                        <TermSelector changeState={updateFormValue} fieldName={'term'} />
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
                            onReset={resetFormValues}
                        />
                    )}
                </div>
            </form>
            <PrivacyPolicyBanner />
        </>
    );
};

export default withStyles(styles)(SearchForm);
