import AppStore from '../../stores/AppStore';
import React, { Component, Fragment, PureComponent } from 'react';
import { Grid, Typography } from '@material-ui/core';
import SectionTable from '../SectionTable/SectionTable.js';
import { withStyles } from '@material-ui/core/styles';

const styles = {
    container: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleRow: {
        display: 'inline-flex',
        justifyContent: 'space-between',
    },
};


export class CustomEventTable extends PureComponent{
    render(){
      console.log(this.props)
      return(
          <Fragment>
            <table className = "customEvents">

              <thead>
                <tr>
                  <th> Color </th>
                  <th> Edit </th>
                  <th> Delete </th>
                  <th> Event </th>
                  <th> Time </th>
                </tr>
              </thead>
              <tbody>
                {this.props.customEvents.map((customEvent) =>{
                  return(
                  <CustomEventTableBody
                    event = {customEvent}
                  />);
                })
                }
              </tbody>

            </table>
          </Fragment>
      )
    }
}

class CustomEventTableBody extends Component{

  render(){
    console.log('Gotten to here')
    const eventInfo = this.props.event
    return(
      <tr>
        <td> {eventInfo.color} </td>
        <td> editPlaceHolder </td>
        <td> deletePlaceHolder </td>
        <td> {eventInfo.title} </td>
        <td> AddTiming </td>
      </tr>
    )
  }
}
