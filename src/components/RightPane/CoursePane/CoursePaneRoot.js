import React, { PureComponent } from 'react';
import SearchForm from './SearchForm/SearchForm';
import CoursePaneButtonRow from './CoursePaneButtonRow';
import CourseRenderPane from './CourseRenderPane';
import { withStyles } from '@material-ui/core/styles';
import RightPaneStore from '../../../stores/RightPaneStore';
import dispatcher from '../../../dispatcher';
import { clearCache } from '../../../helpers';
import { openSnackbar } from '../../../actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '../../../analytics';

const styles = {
    container: {
        height: '100%',
    },
};

class RightPane extends PureComponent {
    // When a user clicks the refresh button in CoursePaneButtonRow,
    // we increment the refresh state by 1.
    // Since it's the key for CourseRenderPane, it triggers a rerender
    // and reloads the latest course data
    state = {
        refresh: 0,
    };

    returnToSearchBarEvent = (event) => {
        if (
            !(RightPaneStore.getDoDisplaySearch() || RightPaneStore.getOpenSpotAlertPopoverActive()) &&
            (event.key === 'Backspace' || event.key === 'Escape')
        ) {
            event.preventDefault();
            dispatcher.dispatch({
                type: 'TOGGLE_SEARCH',
            });
            this.forceUpdate();
        }
    };

    componentDidMount() {
        document.addEventListener('keydown', this.returnToSearchBarEvent, false);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.returnToSearchBarEvent, false);
    }

    refreshSearch = () => {
        logAnalytics({
            category: analyticsEnum.classSearch.title,
            action: analyticsEnum.classSearch.actions.REFRESH,
        });
        clearCache();
        this.setState({ refresh: this.state.refresh + 1 });
    };

    toggleSearch = () => {
        if (
            RightPaneStore.getFormData().ge !== 'ANY' ||
            RightPaneStore.getFormData().deptValue !== 'ALL' ||
            RightPaneStore.getFormData().sectionCode !== '' ||
            RightPaneStore.getFormData().instructor !== ''
        ) {
            dispatcher.dispatch({
                type: 'TOGGLE_SEARCH',
            });
            this.forceUpdate();
        } else {
            openSnackbar(
                'error',
                `Please provide one of the following: Department, GE, Course Code/Range, or Instructor`
            );
        }
    };

    render() {
        return (
            <>
                <CoursePaneButtonRow
                    showSearch={!RightPaneStore.getDoDisplaySearch()}
                    onDismissSearchResults={this.toggleSearch}
                    onRefreshSearch={this.refreshSearch}
                />
                {RightPaneStore.getDoDisplaySearch() ? (
                    <SearchForm toggleSearch={this.toggleSearch} />
                ) : (
                    <CourseRenderPane key={this.state.refresh} />
                )}
            </>
        );
    }
}

export default withStyles(styles)(RightPane);
