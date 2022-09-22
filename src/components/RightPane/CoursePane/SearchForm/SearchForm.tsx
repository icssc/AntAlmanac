import React, {FormEvent, useState} from 'react';
import TermSelector from './TermSelector';
import { withStyles } from '@material-ui/core/styles';
import PrivacyPolicyBanner from './PrivacyPolicyBanner';
import RightPaneStore from '../../RightPaneStore';
import FuzzySearch from './FuzzySearch';
import LegacySearch from './LegacySearch';
import {IconButton, Theme, Tooltip} from '@material-ui/core';
import { Tune } from '@material-ui/icons';
import analyticsEnum, { logAnalytics } from '../../../../analytics';
import {ClassNameMap} from "@material-ui/core/styles/withStyles";
import {Styles} from "@material-ui/core/styles/withStyles";

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
    fallback: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};

const SearchForm = (props: { classes: ClassNameMap, toggleSearch: () => void }) => {
    const { classes, toggleSearch } = props;

    const [showLegacySearch, setShowLegacySearch] = useState(false);

    const toggleShowLegacySearch = () => {
        setShowLegacySearch(!showLegacySearch);
    };

    const onFormSubmit = (event: FormEvent) => {
        event.preventDefault();
        toggleSearch();
    };

    return (
        <>
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
            <PrivacyPolicyBanner />
        </>
    );
};

export default withStyles(styles as unknown as Styles<Theme, {}>)(SearchForm);
