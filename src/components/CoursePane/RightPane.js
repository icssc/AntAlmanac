import React, { PureComponent } from 'react';
import SearchForm from '../SearchForm/SearchForm';
import CoursePaneButtonRow from './CoursePaneButtonRow';
import CourseRenderPane from './CourseRenderPane';
import { withStyles } from '@material-ui/core/styles';
import RightPaneStore from '../../stores/RightPaneStore';
import dispatcher from '../../dispatcher';
import SectionCodeSearchBar from '../SearchForm/SectionCodeSearchBar';
import { openSnackbar } from '../../actions/AppStoreActions';

const styles = {
    container: {
        height: '100%',
    },
};

class RightPane extends PureComponent {
    toggleSearch = () => {
        if(RightPaneStore.getFormData().ge != 'ANY' || RightPaneStore.getFormData().deptValue != 'ALL' || 
            RightPaneStore.getFormData().sectionCode != "" || RightPaneStore.getFormData().instructor != ""){
            dispatcher.dispatch({
                type: 'TOGGLE_SEARCH',
            });
            this.forceUpdate();
        }
        else{
            openSnackbar(
                'error',
                `Please provide one of the following: GE, Department, Course Code or Range, or Instructor`
            );
        }
    };

    render() {
        return (
            <>
                <CoursePaneButtonRow
                    showSearch={!RightPaneStore.getDoDisplaySearch()}
                    onDismissSearchResults={this.toggleSearch}
                />
                {RightPaneStore.getDoDisplaySearch() ? (
                    <SearchForm toggleSearch={this.toggleSearch} />
                ) : (
                    <CourseRenderPane />
                )}
            </>
        );
    }
}

export default withStyles(styles)(RightPane);
