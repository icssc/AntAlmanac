import React, { Component, Suspense } from 'react';
import SearchForm from '../SearchForm/SearchForm';
import loadingGif from '../SearchForm/Gifs/loading.mp4';
import CoursePaneButtonRow from './CoursePaneButtonRow';
import { withStyles } from '@material-ui/core/styles';

const CourseRenderPane = React.lazy(() =>
    import('../CoursePane/CourseRenderPane')
);

const styles = {
    loadingGifStyle: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
};

class RightPane extends Component {
    constructor(props) {
        super(props);
        this.state = {
            courseData: null,
            showSearch: true,
        };
    }

    updateData = async (data, term, dept, ge) => {
        data = await data;
        this.setState({
            courseData: data,
            showSearch: false,
            term: term,
            dept: dept,
            ge: ge,
        });
    };

    handleDismissSearchResults = () => {
        this.setState({ showSearch: true, courseData: null });
    };

    render() {
        const { classes } = this.props;
        let currentView;

        if (this.state.showSearch) {
            currentView = <SearchForm updateData={this.updateData} />;
        } else {
            currentView = (
                <Suspense
                    fallback={
                        <div className={classes.loadingGifStyle}>
                            <video autoPlay loop>
                                <source src={loadingGif} type="video/mp4" />
                            </video>
                        </div>
                    }
                >
                    <CourseRenderPane
                        onToggleDismissButton={this.handleToggleDismissButton}
                        courseData={this.state.courseData}
                        view={2}
                        term={this.props.term}
                        ge={this.props.ge}
                        dept={this.props.dept}
                    />
                </Suspense>
            );
        }

        return (
            <div>
                <CoursePaneButtonRow
                    show={!this.state.showSearch}
                    onDismissSearchResults={this.handleDismissSearchResults}
                />
                {currentView}
            </div>
        );
    }
}

RightPane.propTypes = {};

export default withStyles(styles)(RightPane);
