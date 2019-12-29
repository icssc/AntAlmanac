import DeptSearchBar from './DeptSearchBar/DeptSearchBar';
import MobileDeptSelector from './DeptSearchBar/MobileDeptSelector';
import GESelector from './GESelector';
import TermSelector from './TermSelector';
import SectionCodeSearchBar from './SectionCodeSearchBar';
import CourseNumberSearchBar from './CourseNumberSearchBar';
import React, { Component, Fragment } from 'react';
import { Button, Typography, Collapse } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AdvancedSearch from './AdvancedSearch';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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
        backgroundColor: '#72a9ed',
        boxShadow: 'none',
    },
    mobileSearchButton: {
        backgroundColor: '#72a9ed',
        boxShadow: 'none',
        marginLeft: 5,
    },
};

class SearchForm extends Component {
    componentDidMount = () => {
        document.addEventListener('keydown', this.enterEvent, false);
    };

    componentWillUnmount = () => {
        document.addEventListener('keydown', this.enterEvent, false);
    };

    enterEvent = (event) => {
        const charCode = event.which ? event.which : event.keyCode;
        if (
            (charCode === 13 || charCode === 10) &&
            document.activeElement.id === 'downshift-0-input'
        ) {
            this.props.searchWebSoc(this.state);
            event.preventDefault();

            return false;
        }
    };

    render() {
        const { classes } = this.props;
        const isMobile = window.innerWidth < 960;

        return (
            <div className={classes.container}>
                <div className={classes.margin}>
                    <TermSelector />
                    {isMobile ? (
                        <Button
                            variant="contained"
                            onClick={() => this.props.searchWebSoc()}
                            className={classes.mobileSearchButton}
                        >
                            Search
                        </Button>
                    ) : (
                        <Fragment />
                    )}
                </div>

                <div className={classes.margin}>
                    {isMobile ? <MobileDeptSelector /> : <DeptSearchBar />}
                    <CourseNumberSearchBar />
                </div>

                <div className={classes.margin}>
                    <GESelector />
                    <SectionCodeSearchBar />
                </div>

                <AdvancedSearch />

                <div className={classes.search}>
                    {isMobile ? (
                        <Fragment />
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => this.props.searchWebSoc()}
                            className={classes.searchButton}
                        >
                            Search
                        </Button>
                    )}
                </div>

                {/*<div className={classes.new}>
          <Typography>
            <b>New on AntAlmanac:</b>
            <br />
            Add online/TBA classes!
            <br />
            Download .ics files of your calendars!
            <br />
            See finals schedules
          </Typography>
        />*/}
            </div>
        );
    }
}

export default withStyles(styles)(SearchForm);
