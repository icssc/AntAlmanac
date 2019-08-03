import { withStyles } from '@material-ui/core/styles';
import { Paper, Typography, Grid, Modal } from '@material-ui/core';
import React, { Component, Fragment } from 'react';
import CourseDetailPane from './CourseDetailPane';
import SchoolDeptCard from './SchoolDeptCard';
import SectionTable from '../SectionTable/SectionTable.js';
import NoNothing from './static/no_results.png';
import AdAd from './static/ad_ad.png';

//styling
const styles = (theme) => ({
    course: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        minHeight: theme.spacing.unit * 6,
        cursor: 'pointer',
    },
    text: {
        flexGrow: 1,
        display: 'inline',
        width: '100%',
    },
    ad: {
        flexGrow: 1,
        display: 'inline',
        width: '100%',
    },
    icon: {
        cursor: 'pointer',
        marginLeft: theme.spacing.unit,
    },
    modal: {
        position: 'absolute',
    },
    root: {
        height: '100%',
        position: 'relative',
    },
});



class CourseRenderPane extends Component {
    constructor(props) {
        console.log('Course Pane Render')
        console.log(props)
        super(props);
        this.handleDismissDetails = this.handleDismissDetails.bind(this);
        this.state = {
            courseDetailsOpen: false,
            course: null,
        };
        this.ref = null;
        this.scrollPos = null;
    }

    toRender = (SOCObject) => {
        this.props.onToggleDismissButton();
        this.scrollPos = document.getElementById('rightPane').scrollTop;
        document.getElementById('rightPane').scrollTop = 0;
        this.setState({ course: SOCObject, courseDetailsOpen: true });
    };
    //TODO: HOC for School/Dept separation instead of the solution I got now
    getGrid = (SOCObject) => {
        return (
            <Fragment>
                {SOCObject.schools.map((school) => {
                    return (
                        <Fragment>
                            <SchoolDeptCard
                                comment={school.schoolComment}
                                type={'school'}
                                name={school.schoolName}
                            />
                            {school.departments.map((department) => {
                                return (
                                    <Fragment>
                                        <SchoolDeptCard
                                            name={
                                                'Department of ' +
                                                department.deptName
                                            }
                                            comment={department.deptComment}
                                            type={'dept'}
                                        />
                                        {department.courses.map((course) => {
                                            return this.props.view === 1 ? (
                                                <Grid item md={6} xs={12}>
                                                    <Paper
                                                        elevation={3}
                                                        className={
                                                            this.props.classes
                                                                .course
                                                        }
                                                        square
                                                        onClick={() =>
                                                            this.toRender(
                                                                course
                                                            )
                                                        }
                                                    >
                                                        <Typography
                                                            variant="button"
                                                            className={
                                                                this.props
                                                                    .classes
                                                                    .text
                                                            }
                                                        >
                                                            {department.deptCode +
                                                                ' ' +
                                                                department.courseNumber +
                                                                ' ' +
                                                                department.courseTitle}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            ) : (
                                                <Grid item md={12} xs={12}>
                                                    <SectionTable
                                                        formData={
                                                            this.props.formData
                                                        }
                                                        courseDetails={course}
                                                        term={this.props.term}
                                                    />
                                                </Grid>
                                            );
                                        })}
                                    </Fragment>
                                );
                            })}
                        </Fragment>
                    );
                })}
            </Fragment>
        );
    };

    

    handleDismissDetails() {
        this.props.onToggleDismissButton();
        this.setState({ courseDetailsOpen: false, course: null }, () => {
            document.getElementById('rightPane').scrollTop = this.scrollPos;
        });
    }

    render() {
        return (
            <div
                className={this.props.classes.root}
                ref={(ref) => (this.ref = ref)}
            >
                <Modal
                    className={this.props.classes.modal}
                    disablePortal
                    hideBackdrop
                    container={this.ref}
                    disableAutoFocus
                    disableBackdropClick
                    disableEnforceFocus
                    disableEscapeKeyDown
                    open={this.state.courseDetailsOpen}
                    onClose={this.handleDismissDetails}
                >
                    <CourseDetailPane
                        courseDetails={this.state.course}
                        onDismissDetails={this.handleDismissDetails}
                        termName={this.props.term}
                    />
                </Modal>

                {this.props.courseData.length === 0 ? (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <img src={NoNothing} alt="" />
                    </div>
                ) : (
                    <Grid container spacing={16}>
                        <Grid item md={12} xs={12}>
                            <a
                                href="https://forms.gle/irQBrBkqHYYxcEU39"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src={AdAd}
                                    alt=""
                                    className={this.props.classes.ad}
                                />
                            </a>
                        </Grid>
                        {this.getGrid(this.props.courseData)}
                    </Grid>
                )}
            </div>
        );
    }
}

export default withStyles(styles)(CourseRenderPane);
