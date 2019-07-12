import React, { Component, Fragment, Suspense } from 'react';
import directory from './banner_directory';

export default class Advert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lucky: 0,
      department: 'apple',
    };
    // console.log('Ad:');
    // console.log(this.props.dept);
    this.changeLucky = this.changeLucky.bind(this);
  }

  componentDidMount() {
    this.changeLucky();
  }

  changeLucky() {
    var x = (Math.random() * directory.length) >> 0;
    while (!this.checkDept(x)) {
      //console.log(x);
      x = (Math.random() * directory.length) >> 0;
    }
    this.setState({
      lucky: x,
    });
  }

  checkDept(thing) {
    var wanted = directory[thing].dept;
    return wanted.includes(this.props.dept) || wanted.includes('any');
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

/*
<a
  href={directory[lucky].url}
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src={directory[lucky].banner}
    alt="banner"
    className={this.props.classes.ad}
  />
</a>
*/
