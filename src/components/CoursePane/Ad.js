import React, { Component, Fragment, Suspense } from 'react';
import directory from './banner_directory';

export default class Advert extends Component {
  constructor(props) {
    super(props);
    this.convert = {};
    this.totalNumbers = 0;
    this.state = {
      lucky: 0,
      department: 'apple',
    };
    // console.log('Ad:');
    // console.log(this.props.dept);
    this.changeLucky = this.changeLucky.bind(this);
    this.inputConversions();
  }

  componentDidMount() {
    this.changeLucky();
  }

  changeLucky() {
    var x = this.converter((Math.random() * this.totalNumbers) >> 0);
    while (!this.checkDept(x)) {
      //console.log(x);
      x = this.converter((Math.random() * this.totalNumbers) >> 0);
    }
    this.setState({
      lucky: x,
    });
  }

  converter(number) {
    for (var i in this.convert) {
      if (number <= this.convert[i]) {
        return i;
      }
    }
  }

  checkDept(thing) {
    var wanted = directory[thing].dept;
    return wanted.includes(this.props.dept) || wanted.includes('any');
  }

  inputConversions() {
    var count = 0;
    for (var i = 0; i < directory.length; i += 1) {
      count = (directory[i].dept.match(/,/g) || []).length;
      this.convert[i] = 28 - count;
      if (directory[i].dept.includes('any')) {
        this.convert[i] = 1;
      }
    }
    for (var item in this.convert) {
      for (var number = 0; number < this.convert[item]; number += 1) {
        this.totalNumbers += 1;
      }
      this.convert[item] = this.totalNumbers;
    }
    console.log(this.convert);
  }

  render() {
    return (
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
    );
  }
}
