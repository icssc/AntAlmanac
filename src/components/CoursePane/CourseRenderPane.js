import { withStyles } from '@material-ui/core/styles';
import { Paper, Typography, Grid, Modal } from '@material-ui/core';
import React, { Component, Fragment, Suspense } from 'react';
import CourseDetailPane from './CourseDetailPane';
import SchoolDeptCard from './SchoolDeptCard';
import NoNothing from './no_results.png';
import loadingGif from '../CoursePane/loading.mp4';
import Outreach from './Outreach';

const MiniSectionTable = React.lazy(() => import('./MiniSectionTable'));

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
    super(props);
    //console.log(props);
    this.getGrid = this.getGrid.bind(this);
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

  getGrid(SOCObject) {
    if ('departments' in SOCObject) {
      return (
        // <SchoolDeptCard
        //   comment={SOCObject.comment}
        //   type={"school"}
        //   name={SOCObject.name}
        // />
        <Fragment />
      );
    } else if ('courses' in SOCObject) {
      return (
        <SchoolDeptCard
          name={'Department of ' + SOCObject.name[1]}
          comment={SOCObject.comments.join('\n')}
          type={'dept'}
        />
      );
    } else {
      return this.props.view === 1 ? (
        <Grid item md={6} xs={12}>
          <Paper
            elevation={3}
            className={this.props.classes.course}
            square
            onClick={() => this.toRender(SOCObject)}
          >
            <Typography variant="button" className={this.props.classes.text}>
              {SOCObject.name[0] +
                ' ' +
                SOCObject.name[1] +
                ' | ' +
                SOCObject.name[2]}
            </Typography>
          </Paper>
        </Grid>
      ) : (
        <Grid item md={12} xs={12}>
          <Suspense
            fallback={
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                }}
              >
                <video autoPlay loop>
                  <source src={loadingGif} type="video/mp4" />
                </video>
              </div>
            }
          >
            <MiniSectionTable
              currentScheduleIndex={this.props.currentScheduleIndex}
              name={
                SOCObject.name[0] +
                ' ' +
                SOCObject.name[1] +
                ' | ' +
                SOCObject.name[2]
              }
              formData={this.props.formData}
              courseDetails={SOCObject}
              onAddClass={this.props.onAddClass}
              termName={this.props.termName}
              destination={this.props.destination}
            />
          </Suspense>
        </Grid>
      );
    }
  }

  handleDismissDetails() {
    this.props.onToggleDismissButton();
    this.setState({ courseDetailsOpen: false, course: null }, () => {
      document.getElementById('rightPane').scrollTop = this.scrollPos;
    });
  }

  render() {
    return (
      <div className={this.props.classes.root} ref={(ref) => (this.ref = ref)}>
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
            onAddClass={this.props.onAddClass}
            termName={this.props.termName}
            destination={this.props.destination}
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
              backgroundColor: 'white',
            }}
          >
            <img src={NoNothing} alt="" />
          </div>
        ) : (
          <Grid container spacing={16}>
            <Grid item md={12} xs={12}>
              <Outreach
                className={this.props.classes.ad}
                dept={this.props.deptName}
              />
            </Grid>
            {this.props.courseData.map((item) => this.getGrid(item))}
          </Grid>
        )}
      </div>
    );
  }
}

export default withStyles(styles)(CourseRenderPane);
