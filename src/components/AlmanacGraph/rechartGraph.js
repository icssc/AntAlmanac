import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { AreaChart, linearGradient, stop, defs, Area } from 'recharts';
import { CustomToolTipNum } from './ToolTip';

const AxisLabel = ({ axisType, x, y, width, height, stroke, children }) => {
  const isVert = axisType === 'yAxis';
  const cx = isVert ? x : x + width / 2;
  const cy = isVert ? height / 2 + y : y + height + 10;
  const rot = isVert ? `270 ${cx} ${cy}` : 0;
  return (
    <text
      x={cx}
      y={cy}
      transform={`rotate(${rot})`}
      textAnchor="middle"
      stroke={stroke}
    >
      {children}
    </text>
  );
};

export class Chart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      waitColor: this.props.wait,
      waitOpacity: 1,
      waitName: 'wait',
    };
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(o) {
    if (this.state.waitName === 'wait') {
      this.setState({
        waitName: 'nothing',
        waitOpacity: (this.state.waitOpacity + 1) % 2,
      });
    } else {
      this.setState({
        waitName: 'wait',
        waitOpacity: (this.state.waitOpacity + 1) % 2,
      });
    }
  }

  // createElement(data){
  //   var list = '';
  //   var j = 1;
  //   console.log(data)
  //   for (var i =0; i < data.length; i++){
  //     if (data[i]['name'].substring(0,4) == 'Full'){
  //       console.log('making reference line')
  //       list += "<ReferenceLine x= 'Full " + String(j) + "' stroke='red' label='Filled'> </ReferenceLine>"
  //     }
  //     else if(data[i]['name'].substring(0,4) == 'Open'){
  //       list += "<ReferenceLine x='Open " + String(j) +"' stroke='green' label='Opened'> </ReferenceLine>"
  //       j++
  //     }
  //   }
  //   console.log(list)
  //   return parse(list)
  // }

  // Legends never die

  // Refernce Line with vertical
  //<ReferenceLine  x ={opening} stroke = 'black' strokeDasharray = "2 2" label = {{offset: '-8',position:"left", value:'Restrictions lifted', angle: "90"}} />

  render() {
    var tooltip = <CustomToolTipNum />;
    let data = this.props.data;
    let enrolledColor = this.props.enrolled;
    let waitColor = this.props.wait;
    //console.log(data)
    return (
      <AreaChart
        width={950}
        height={500}
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
        <YAxis
          label={
            <AxisLabel axisType="yAxis" x={15} y={125} width={100} height={150}>
              {' '}
              Number of People
            </AxisLabel>
          }
        />
        <CartesianGrid strokeDasharray="3 3" />
        <ReferenceLine y={0} stroke="black" />
        <Tooltip content={tooltip} />
        <Area
          name=" Waitlist"
          type="monotone"
          dataKey={this.state.waitName}
          stroke={waitColor}
          fillOpacity={1}
          fill="url(#colorwait)"
        />
        <Area
          name=" Max Enrollment"
          type="monotone"
          dataKey="max"
          stroke="red"
          fillOpacity={0}
        />
        <Area
          name=" Enrolled"
          type="monotone"
          dataKey="fullEnroll"
          stroke={enrolledColor}
          fillOpacity={1}
          fill="url(#full)"
          strokeWidth={2}
        />
        <Area
          legendType="none"
          type="monotone"
          dataKey="enrolled"
          stroke={enrolledColor}
          fillOpacity={1}
          fill="url(#colorenrolled)"
          strokeWidth={2}
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
              color: 'red',
            },
            {
              id: 'enrolled',
              value: 'Enrolled',
              type: 'line',
              color: `${enrolledColor}`,
            },
            {
              id: 'waitlist',
              value: 'Waitlist',
              type: 'line',
              color: `${waitColor}`,
            },
          ]}
        />
      </AreaChart>
    );
  }
}
