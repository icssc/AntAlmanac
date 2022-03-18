import DeptSearchBar from './DeptSearchBar/DeptSearchBar';
import GESelector from './GESelector';
import TermSelector from './TermSelector';
import SectionCodeSearchBar from './SectionCodeSearchBar';
import CourseNumberSearchBar from './CourseNumberSearchBar';
import React, { PureComponent } from 'react';
import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AdvancedSearch from './AdvancedSearch';
import PrivacyPolicyBanner from '../App/PrivacyPolicyBanner';
import { resetFormValues } from '../../actions/RightPaneActions';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    search: {
        display: 'flex',
        justifyContent: 'center',
        borderTop: 'solid 8px transparent',
    },
    margin: {
        borderTop: 'solid 8px transparent',
        display: 'inline-flex',
    },
    new: {
        width: '55%',
        position: 'absolute',
        bottom: 0,
        left: 0,
    },
    searchButton: {
        width: '50%',
    },
    buttonContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-evenly',
    },
};

class SearchForm extends PureComponent {
    /*
    componentDidMount = () => {
        this.form.addEventListener('keydown', this.enterEvent);
    };

    componentWillUnmount = () => {
        this.form.removeEventListener('keydown', this.enterEvent);
    };

    enterEvent = (event) => {
        if (event.code === 'Enter' || event.key === 'Enter') {
            console.log("Enter is clicked")
            event.preventDefault();
            this.props.toggleSearch();
        }
    };
    */
    onFormSubmit = (event) => {
        event.preventDefault();
        this.props.toggleSearch();
    };

    render() {
        const { classes } = this.props;

        return (
            <form onSubmit={this.onFormSubmit}>
                {/*<div className={classes.container} ref={(node) => (this.form = node)}*/}
                <div className={classes.container}>
                    <div className={classes.margin}>
                        <TermSelector />
                    </div>

                    <div className={classes.margin}>
                        <DeptSearchBar />
                        <CourseNumberSearchBar />
                    </div>

                    <div className={classes.margin}>
                        <GESelector />
                        <SectionCodeSearchBar />
                    </div>

                    <AdvancedSearch />

                    <div className={classes.search}>
                        <div className={classes.buttonContainer}>
                            <Button
                                className={classes.searchButton}
                                color="primary"
                                variant="contained"
                                onClick={() => this.props.toggleSearch()}
                                type="submit"
                            >
                                Search
                            </Button>

                            <Button variant="contained" onClick={resetFormValues}>
                                Reset
                            </Button>
                        </div>
                    </div>

                    <PrivacyPolicyBanner />
                </div>
            </form>
        );
    }
}

export default withStyles(styles)(SearchForm);
