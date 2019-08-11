import AppStore from '../../stores/AppStore';
import React, { Component, Suspense, Fragment } from 'react';
import loadingGif from '../SearchForm/Gifs/loading.mp4';

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

  //pass courses down
  loadCourses = async () =>{
    console.log('got in here')
    this.setState({
      courses: await AppStore.getAddedCourses(),
      loaded: true,
    })
    console.log(this.state)
  }

  render(){
    if (this.state.loaded){
      console.log(this.state.courses)
      return(
        <div>
          <p>apples </p>
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
