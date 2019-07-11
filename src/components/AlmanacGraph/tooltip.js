import React from 'react';
import './tooltip.css';

export const CustomToolTipNum = ({ active, payload, label }) => {
  var max = '';
  var enroll = '';
  var waitlist = '';
  var lable = label;
  var style;
  var waitList = true;
  //console.log((label == 'FUll') ? payload[0].payload.day: label)
  try {
    if (label.substring(0, 4) === 'Full') {
      lable = payload[0].payload.day;
    } else if (label.substring(0, 4) === 'Open') {
      lable = payload[0].payload.day;
    }
    max = String(payload[1].value);
    enroll = String(payload[2].value);
    //console.log(payload[0].value[0])
    waitlist = String(payload[0].value[0] - payload[0].value[1]);
    //console.log(difference)
    //console.log(payload)
    if (payload[1].value <= payload[2].value) {
      style = {
        color: 'red',
        opacity: '.8',
      };
    } else {
      style = {
        color: 'blue',
        opacity: '.8',
      };
    }
  } catch (err) {
    //console.log(err)
    waitList = false;
    try {
      if (label.substring(0, 4) === 'Full') {
        lable = payload[0].payload.day;
      } else if (label.substring(0, 4) === 'Open') {
        lable = payload[0].payload.day;
      }
      max = String(payload[0].value);
      enroll = String(payload[1].value);
      //console.log(payload[0].value[0])
      //console.log(difference)
      //console.log(payload)
      if (payload[0].value <= payload[1].value) {
        style = {
          color: 'red',
          opacity: '.8',
        };
      } else {
        style = {
          color: 'blue',
          opacity: '.8',
        };
      }
    } catch (errr) {
      //console.log(errr)
    }
  }
  if (waitlist === 'NaN') {
    waitList = false;
  }
  //console.log('difference: ' + difference)

  if (active) {
    if (waitList) {
      return (
        <div
          className="custom-tooltip"
          style={{ border: '1px solid black', background: '#F4F4F4' }}
        >
          <p className="label">{lable}</p>
          <p>
            Max: <span style={{ color: 'red', opacity: '.8' }}>{`${max}`}</span>
          </p>
          <p>
            Enrolled: <span style={style}>{`${enroll}`}</span>
          </p>
          <p>
            Waitlist: <span style={{ color: '#BBBB00' }}> {`${waitlist}`}</span>
          </p>
        </div>
      );
    } else {
      return (
        <div
          className="custom-tooltip"
          style={{ border: '1px solid black', background: '#F4F4F4' }}
        >
          <p className="label">{lable}</p>
          <p>
            Max: <span style={{ color: 'red', opacity: '.8' }}>{`${max}`}</span>
          </p>
          <p>
            Enrolled: <span style={style}>{`${enroll}`}</span>
          </p>
        </div>
      );
    }
  }

  return null;
};
