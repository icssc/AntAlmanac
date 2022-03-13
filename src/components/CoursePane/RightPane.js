import React, { Fragment, PureComponent } from 'react';
import SearchForm from '../SearchForm/SearchForm';
import CoursePaneButtonRow from './CoursePaneButtonRow';
import CourseRenderPane from './CourseRenderPane';
import { withStyles } from '@material-ui/core/styles';
import RightPaneStore from '../../stores/RightPaneStore';
import dispatcher from '../../dispatcher';

const styles = {
    container: {
        height: '100%',
    },
};

class RightPane extends PureComponent {
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
                />
                {RightPaneStore.getDoDisplaySearch() ? (
                    <SearchForm toggleSearch={this.toggleSearch} />
                ) : (
                    <CourseRenderPane />
                )}
            </Fragment>
        );
    }
}

export default withStyles(styles)(RightPane);
