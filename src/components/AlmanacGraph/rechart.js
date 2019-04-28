import React, {Component} from 'react';
import { XAxis, YAxis, CartesianGrid, LineChart,Line,Legend, Label, Tooltip, ReferenceLine } from 'recharts';

export default class Graph extends Component {
    state = {
        enrolledColor:'#8884d8',
        reqColor:"#82ca9d",
        waitColor:"#fad700",
        maxColor:"#ff0000",
    };
  
	render () {
    console.log(this.props.rawData)
  	return (
    	<LineChart width={950} height={500} data={this.props.rawData}
            margin={{top: 25, right: 30, left: 70, bottom: 5}}>
       <XAxis dataKey="name"/>
       <YAxis/>
       <CartesianGrid strokeDasharray="3 3"/>
       <Tooltip/>
       <Legend iconSize={35} iconType='circle' margin={ {top: 200,  right: 20 }}/>

      {/**  <ReferenceLine y={this.props.rawData.max} label="max" stroke="red" alwaysShow/> */}
       <Line type="monotone" dataKey="max"      stroke={this.state.maxColor} activeDot={{ stroke: '#f01414', strokeWidth: 4, r: 7 }}/>
       <Line type="monotone" dataKey="enrolled" stroke={this.state.enrolledColor} activeDot={{ stroke: '#8884d8', strokeWidth: 4, r: 7 }}/>
       <Line type="monotone" dataKey="requisted"      stroke={this.state.reqColor}      activeDot={{ stroke: '#82ca9d', strokeWidth: 4, r: 7 }}/>
       <Line type="linearClosed" dataKey="waitlist" stroke={this.state.waitColor}     activeDot={{ stroke: '#fad700', strokeWidth: 4, r: 7 }}/>

      </LineChart>
    );
  }
}
