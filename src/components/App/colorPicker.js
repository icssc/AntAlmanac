import React from 'react';
import PropTypes from 'prop-types';
import { Popover } from '@material-ui/core';
import { SketchPicker } from 'react-color';

class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      color: this.props.event.color,
    };
  }

  handleClick = (event) => {
    if (!event) event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();

    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = (event) => {
    if (!event) event = window.event;
    if (event.stopPropagation) event.stopPropagation();
    this.setState({
      anchorEl: null,
    });
  };

  handleColorChange = (color) => {
    this.setState({ color: color.hex }, () => {
      this.props.onColorChange(this.props.event, this.state.color);
    });
  };

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div
        style={{ backgroundColor: this.props.event.color }}
        onClick={(e) => {
          this.handleClick(e);
        }}
      >
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <SketchPicker
            color={this.state.color}
            onChange={this.handleColorChange}
          />
        </Popover>
      </div>
    );
  }
}

ColorPicker.propTypes = {
  event: PropTypes.object.isRequired,
  onColorChange: PropTypes.func.isRequired,
};

export default ColorPicker;
