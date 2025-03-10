import { IconButton, Theme, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Tune } from '@material-ui/icons';
import type { FormEvent } from 'react';

import RightPaneStore from '../../RightPaneStore';

import FuzzySearch from './FuzzySearch';
import PrivacyPolicyBanner from './PrivacyPolicyBanner';
import TermSelector from './TermSelector';

import { HelpBox } from '$components/RightPane/CoursePane/SearchForm/HelpBox';
import { LegacySearch } from '$components/RightPane/CoursePane/SearchForm/LegacySearch';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
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

    const onFormSubmit = (event: FormEvent) => {
        event.preventDefault();
        toggleSearch();
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
                        <FuzzySearch toggleSearch={toggleSearch} toggleShowLegacySearch={toggleManualSearch} />
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
