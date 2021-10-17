import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Popover, IconButton } from '@material-ui/core';
import { SketchPicker } from 'react-color';
import { changeCourseColor, changeCustomEventColor } from '../../actions/AppStoreActions';
import { ColorLens } from '@material-ui/icons';
import ReactGA from 'react-ga';
import dispatcher from '../../dispatcher';

class ColorPicker extends PureComponent {
    state = {
        anchorEl: null,
        color: this.props.color,
    };

    constructor(props) {
        super(props);
        dispatcher.register(this.handleIconChange.bind(this));
    }

    handleClick = (event) => {
        event.stopPropagation();

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
            if (this.props.isCustomEvent) changeCustomEventColor(this.props.customEventID, this.state.color);
            else changeCourseColor(this.props.sectionCode, this.state.color, this.props.term);
        });

        ReactGA.event({
            category: 'antalmanac-rewrite',
            action: 'Change Course Color',
        });
    };

    render() {
        return (
            <span style={{ color: this.state.color }}>
                <IconButton
                    color="inherit"
                    onClick={(e) => {
                        this.handleClick(e);
                    }}
                >
                    <ColorLens fontSize="small" />
                </IconButton>

                <Popover
                    open={Boolean(this.state.anchorEl)}
                    anchorEl={this.state.anchorEl}
                    onClose={this.handleClose}
                    onClick={(e) => e.stopPropagation()}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <SketchPicker color={this.state.color} onChange={this.handleColorChange} />
                </Popover>
            </span>
        );
    }
    handleIconChange(action) {
        switch (action.type) {
            case 'CUSTOM_EVENT_COLOR_UPDATE':
            case 'COURSE_COLOR_UPDATE':
                if (!this.props.isInAdded) {
                    if (
                        (action.customEventID && action.customEventID !== this.props.customEventID) ||
                        (action.sectionCode && action.sectionCode !== this.props.sectionCode)
                    ) {
                        this.setState({ color: action.newColor });
                    }
                }
                break;
            case 'CUSTOM_EVENT_COLOR_CHANGE':
            case 'COURSE_COLOR_CHANGE':
                if (
                    (action.customEventID && action.customEventID === this.props.customEventID) ||
                    (action.sectionCode && action.sectionCode === this.props.sectionCode)
                ) {
                    this.setState({ color: action.newColor });
                }
                break;
            default:
        }
    }
}

ColorPicker.propTypes = {
    color: PropTypes.string.isRequired,
    sectionCode: PropTypes.string,
    isCustomEvent: PropTypes.bool.isRequired,
    isInAdded: PropTypes.bool,
    customEventID: PropTypes.number,
    term: PropTypes.string,
};

export default ColorPicker;
