import React, { Component } from 'react';
import { Typography } from '@material-ui/core';
import directory from './banner_directory';

export default class Outreach extends Component {
  constructor(props) {
    super(props);
    this.assignedProb = {};
    this.totalNumbers = -1;
    this.state = {
      lucky: 0,
      department: 'apple',
    };
    this.changeLucky = this.changeLucky.bind(this);
    this.inputConversions();
  }

  componentDidMount() {
    this.changeLucky();
  }

  //assaign the relavent ad
  changeLucky() {
    this.setState({
      lucky: this.convert((Math.random() * this.totalNumbers) >> 0),
    });
  }

  //gets a number and converts to the associated ad
  convert(number) {
    for (var i in this.assignedProb) {
      if (number <= this.assignedProb[i]) {
        return i;
      }
    }
  }

  //check if ad is for said department
  checkDept(thing) {
    var wanted = directory[thing].dept;
    return wanted.includes(this.props.dept) || wanted.includes('any');
  }

  //gives each ad their own probabilty of showing up
  inputConversions() {
    var count = 0;
    for (var i = 0; i < directory.length; i += 1) {
      count = (directory[i].dept.match(/,/g) || []).length;
      this.assignedProb[i] = 30 - count;
      if (directory[i].dept.includes('any')) {
        this.assignedProb[i] = 4;
      }
    }
    this.activePool();
    //console.log(this.assignedProb);
  }

  //assigns each course the numbers assigned to it within the
  //ads that are active for said department
  activePool() {
    for (var item in this.assignedProb) {
      this.totalNumbers += this.checkDept(item) ? this.assignedProb[item] : 2;
      this.assignedProb[item] = this.totalNumbers;
    }
  }

  render() {
    return (
      <div>
        <Typography fontSize="1" align="right">
          AntAlmanac is not affiliated with the following club/activity
        </Typography>
        <a
          href={directory[this.state.lucky].url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={directory[this.state.lucky].banner}
            alt="banner"
            className={this.props.className}
          />
        </a>
      </div>
    );
  }
}
