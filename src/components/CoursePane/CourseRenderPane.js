import {withStyles} from '@material-ui/core/styles';
import {Paper, Button, Typography, Grid, Modal, Tooltip} from "@material-ui/core";
import {ViewList} from "@material-ui/icons";
import React, {Component} from 'react';
import CourseDetailPane from "./CourseDetailPane";
import SchoolDeptCard from "./SchoolDeptCard";
import CourseInfo from "./CourseInfo";

const styles = theme => ({
    course: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        minHeight: theme.spacing.unit * 6,
    },
    text: {
        flexGrow: 1,
        display: 'inline',
    },
    icon: {
        cursor: 'pointer',
        marginLeft: theme.spacing.unit
    },
    modal: {
        position: 'absolute',
    },
    root: {
        height: '100%',
        position: 'relative'
    }
});

class CourseRenderPane extends Component {
    constructor(props) {
        super(props);
        this.getGrid = this.getGrid.bind(this);
        this.handleDismissDetails = this.handleDismissDetails.bind(this);
        this.state = {courseDetailsOpen: false, course: null};
        this.ref = null;
    }

    getGrid(SOCObject) {
        if ('departments' in SOCObject) {
            return (
                <SchoolDeptCard comment={SOCObject.comment} type={'school'} name={SOCObject.name}/>
            )
        } else if ('courses' in SOCObject) {
            return (
                <SchoolDeptCard name={'Department of ' + SOCObject.name[1]} comment={SOCObject.comments.join('\n')} type={'dept'}/>
            )
        } else {
            return (
                <Grid item md={6} xs={12}>
                    <Paper elevation={3} className={this.props.classes.course} square>

                      <Tooltip title={'Grammar, sentence structure, paragraph and essay organization of formal written English. Prerequisite: Placement into AC ENG 20A. Grading Option: Pass/no pass only.'}>
                        <Typography variant='button' className={this.props.classes.text}>
                            {SOCObject.name[0] + ' ' + SOCObject.name[1]}
                        </Typography>
                      </Tooltip>

                        <ViewList className={this.props.classes.icon}
                                  onClick={() => this.setState({courseDetailsOpen: true, course: SOCObject})}/>
                    </Paper>
                </Grid>
            )
        }
    }

    handleDismissDetails() {
        this.setState({courseDetailsOpen: false, course: null});
    }

    render() {
        return (
            <div className={this.props.classes.root} ref={ref => (this.ref = ref)}>
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
                    onClose={this.handleDismissDetails}>
                    <CourseDetailPane courseDetails={this.state.course}
                                      onDismissDetails={this.handleDismissDetails}
                                      onAddClass={this.props.onAddClass}>
                    </CourseDetailPane>
                </Modal>

                <Grid container spacing={16}>
                    {this.props.courseData.map((item) => this.getGrid(item))}
                </Grid>
            </div>
        )
    }
}

export default withStyles(styles)(CourseRenderPane);