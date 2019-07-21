import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Popover } from '@material-ui/core';
import { SketchPicker } from 'react-color';
import { changeColor } from '../../actions/AppStoreActions';

class ColorPicker extends PureComponent {
    state = {
        anchorEl: null,
        color: this.props.courseInMoreInfo.color,
    };

    handleClick = (event) => {
        if (event.stopPropagation) event.stopPropagation();

        this.setState({
            anchorEl: event.currentTarget,
        });
    };

    handleClose = (event) => {
        if (event.stopPropagation) event.stopPropagation();
        this.setState({
            anchorEl: null,
        });
    };

    handleColorChange = (color) => {
        this.setState({ color: color.hex }, () => {
            changeColor(this.props.courseInMoreInfo, this.state.color);
        });
    };

    render() {
        return (
            <div
                style={{ backgroundColor: this.state.color }}
                onClick={(e) => {
                    this.handleClick(e);
                }}
            >
                <Popover
                    open={Boolean(this.state.anchorEl)}
                    anchorEl={this.state.anchorEl}
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
    onColorChange: PropTypes.func.isRequired,
};

export default ColorPicker;
