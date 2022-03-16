import React, { Fragment, PureComponent } from 'react';
import SearchForm from '../SearchForm/SearchForm';
import CoursePaneButtonRow from './CoursePaneButtonRow';
import CourseRenderPane from './CourseRenderPane';
import { withStyles } from '@material-ui/core/styles';
import RightPaneStore from '../../stores/RightPaneStore';
import dispatcher from '../../dispatcher';
import { clearCache } from '../../helpers';

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

    refreshSearch = () => {
        clearCache();
        this.setState({ refresh: this.state.refresh + 1 });
    };

    toggleSearch = () => {
        dispatcher.dispatch({
            type: 'TOGGLE_SEARCH',
        });
        this.forceUpdate();
    };

    render() {
        return (
            <Fragment>
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
            </Fragment>
        );
    }
}

export default withStyles(styles)(RightPane);
