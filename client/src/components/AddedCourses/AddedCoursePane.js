import AppStore from '../../stores/AppStore';
import React, { Component, Suspense, Fragment } from 'react';
import loadingGif from '../SearchForm/Gifs/loading.mp4';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Typography, Grid, Modal } from '@material-ui/core';
import CourseDetailPane from '../CoursePane/CourseDetailPane';
import SchoolDeptCard from '../CoursePane/SchoolDeptCard';
import SectionTable from '../SectionTable/SectionTable.js';
import NoNothing from '../CoursePane/static/no_results.png';
import AdAd from '../CoursePane/static/ad_ad.png';

export default class AddedCoursePane extends Component{

  constructor(props){
    super(props)
    this.state = {
      loaded: false,
      courses: [],
    }
  }

  componentDidMount = () => {
    this.loadCourses();
  }

  formatSections = (unformatted) =>{
    unformatted[0].sections = [unformatted[0].section]
    return unformatted
  }

  //pass courses down
  loadCourses = async () =>{

    var oneSectionCourses = await AppStore.getAddedCourses();
    oneSectionCourses = this.formatSections(oneSectionCourses);
  
    this.setState({
      courses: this.formatSections(oneSectionCourses),
      loaded: true,
    })

  }

  getGrid = (SOCObject) => {
      return (
          <Fragment>
              {SOCObject.map((classes) => {
                  console.log('passing to section table')
                  console.log(classes)
                  return (
                      <Fragment>
                            <Grid item md={12} xs={12}>
                                <SectionTable
                                    courseDetails={classes}
                                    term={classes.term}
                                />
                            </Grid>

                      </Fragment>
                              );
                          })}
          </Fragment>
      );
  };

  render(){
    //want to add open and oncluse for modal
    //classname for div
    if (this.state.loaded){
      console.log(this.state.courses)
      return(
        <div
            ref={(ref) => (this.ref = ref)}
        >
            {// <Modal
            //     className={this.state.courses.modal}
            //     disablePortal
            //     hideBackdrop
            //     container={this.ref}
            //     disableAutoFocus
            //     disableBackdropClick
            //     disableEnforceFocus
            //     disableEscapeKeyDown
            // >
            //     <CourseDetailPane
            //         courseDetails={this.state.course}
            //         onDismissDetails={this.handleDismissDetails}
            //
            //     />
            // </Modal>
          }

            {this.state.courses.length === 0 ? (
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

                    {this.getGrid(this.state.courses)}
                </Grid>
            )}
        </div>
      )
    }
    else{
      return(
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
    )
    }

  }

}
