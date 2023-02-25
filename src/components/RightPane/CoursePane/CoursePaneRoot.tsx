import { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { openSnackbar } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { clearCache } from '$lib/helpers';
import RightPaneStore from '../RightPaneStore';
import CoursePaneButtonRow from './CoursePaneButtonRow';
import CourseRenderPane from './CourseRenderPane';
import SearchForm from './SearchForm/SearchForm';

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

    returnToSearchBarEvent = (event: KeyboardEvent) => {
        if (
            !(RightPaneStore.getDoDisplaySearch() || RightPaneStore.getOpenSpotAlertPopoverActive()) &&
            (event.key === 'Backspace' || event.key === 'Escape')
        ) {
            event.preventDefault();
            RightPaneStore.toggleSearch();
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
            RightPaneStore.toggleSearch();
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
