import React, { Component } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
  Label,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { CustomToolTipNum } from './tooltip';

export default class Graph extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      enrolledColor: '#8884d8',
      reqColor: '#82ca9d',
      waitColor: '#fad700',
      maxColor: '#ff0000',
      wait: true,
      enrolled: true,
      max: true,
      req: false,
      data: {},
    };
    this.handleOnClick = this.handleOnClick.bind(this);
    this.formatData = this.formatData.bind(this);
  }

  componentDidMount() {
    try {
      this.formatData(this.props.rawData);
    } catch (err) {
      console.log(err);
    }
  }

  noSlash(ssv) {
    //console.log('getting rid of slashes')
    //console.log(typeof ssv)
    return ssv.substring(1, ssv.length - 1).split('/');
  }

  formatData(dataJason) {
    // console.log('datJason')
    // console.log(typeof dataJason.Item.DateInfo)
    var date1 = dataJason.Item.DateInfo; //no idea why this line is needed but if this line is taken out
    //the first call of the function results in an undefined
    var date = this.noSlash(date1);
    var enroll = this.noSlash(dataJason.Item.EnrollmentInfo);
    var max = this.noSlash(dataJason.Item.MaxInfo);
    var req = this.noSlash(dataJason.Item.RequestedInfo);
    var wait = this.noSlash(dataJason.Item.WaitlistInfo);

    var formatedData = [];
    for (var i = 0; i < date.length; i++) {
      formatedData.push({
        name: date[i],
        waitlist: wait[i],
        max: max[i],
        enrolled: enroll[i],
        requested: req[i],
      });
    }
    this.setState({
      data: formatedData,
    });
    console.log(this.state.data);
  }

  handleOnClick(o) {
    if (o.id == 'waitlist') {
      this.setState({
        wait: !this.state.wait,
      });
    }
    if (o.id == 'enrolled') {
      this.setState({
        enrolled: !this.state.enrolled,
      });
    }
    if (o.id == 'maxenroll') {
      this.setState({
        max: !this.state.max,
      });
    }
    if (o.id == 'requested') {
      this.setState({
        req: !this.state.req,
      });
    }
  }

  render() {
    return (
      <AreaChart
        width={950}
        height={500}
        data={this.state.data}
        margin={{ top: 25, right: 30, left: 70, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorenrolled" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.0} />
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorwait" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#edd209" stopOpacity={0.0} />
            <stop offset="100%" stopColor="#edd209" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="full" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d31027" stopOpacity={0.0} />
            <stop offset="95%" stopColor="#d31027" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="black" fillOpacity={1} />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        {/*<Legend iconSize={35} iconType='circle' margin={ {top: 200,  right: 20 }}/>*/}

        {/**  <ReferenceLine y={this.props.rawData.max} label="max" stroke="red" alwaysShow/> */}
        <Area
          name=" Waitlist"
          type="monotone"
          dataKey={this.state.wait ? 'waitlist' : ''}
          stroke={this.state.waitColor}
          fillOpacity={1}
          fill="url(#colorwait)"
        />
        <Area
          name=" Max Enrollment"
          type="monotone"
          dataKey={this.state.max ? 'max' : ''}
          stroke="red"
          fillOpacity={0}
        />
        <Area
          name="Enrolled"
          type="monotone"
          dataKey={this.state.enrolled ? 'enrolled' : ''}
          stroke={this.state.enrolledColor}
          fillOpacity={1}
          fill="url(#colorenrolled)"
          strokeWidth={2}
        />
        {/*<Area type="monotone" dataKey="requisted"      stroke={this.state.reqColor}      activeDot={{ stroke: '#82ca9d', strokeWidth: 4, r: 7 }}/>*/}
        {/*<Area type="linearClosed" dataKey="waitlist" stroke={this.state.waitColor}     activeDot={{ stroke: '#fad700', strokeWidth: 4, r: 7 }}/>*/}
        <Area
          name=" Requested"
          type="monotone"
          dataKey={this.state.req ? 'requested' : ''}
          stroke={this.state.reqColor}
          fillOpacity={0}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          onClick={this.handleOnClick}
          payload={[
            {
              id: 'maxenroll',
              value: 'Max Enrollment',
              type: 'line',
              color: `${this.state.max ? this.state.maxColor : '#FFFFFF'}`,
              iconSize: '30',
            },
            {
              id: 'enrolled',
              value: 'Enrolled',
              type: 'line',
              color: `${
                this.state.enrolled ? this.state.enrolledColor : '#FFFFFF'
              }`,
              iconSize: '30',
            },
            {
              id: 'waitlist',
              value: 'Waitlist',
              type: 'line',
              color: `${this.state.wait ? this.state.waitColor : '#FFFFFF'}`,
              iconSize: '30',
            },
            {
              id: 'requested',
              value: 'Requested',
              type: 'line',
              color: `${this.state.req ? this.state.reqColor : '#FFFFFF'}`,
              iconSize: '30',
            },
          ]}
        />
      </AreaChart>
    );
  }
}
