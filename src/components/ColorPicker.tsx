import { IconButton,Popover } from '@material-ui/core';
import { ColorLens } from '@material-ui/icons';
import React, { PureComponent } from 'react';
import { SketchPicker } from 'react-color';

import { changeCourseColor, changeCustomEventColor } from '../actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '../analytics';
import AppStore from '../stores/AppStore';

interface ColorPickerProps {
    color: string;
    analyticsCategory: string;
    /**If true, this object has a customEventID. If false, this object has a term and sectionCode. */
    isCustomEvent: boolean;
    /**Not undefined when isCustomEvent is true */
    customEventID?: number;
    /**Not undefined  when isCustomEvent is false */
    term?: string;
    /**Not undefined  when isCustomEvent is false */
    sectionCode?: string;
}

class ColorPicker extends PureComponent<ColorPickerProps> {
    state = {
        anchorEl: null,
        color: this.props.color,
    };

    handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.stopPropagation();

        this.setState({
            anchorEl: event.currentTarget,
        });
        logAnalytics({
            category: this.props.analyticsCategory,
            action: analyticsEnum.calendar.actions.CHANGE_COURSE_COLOR,
        });
    };

    handleClose = (event: Event) => {
        if (event.stopPropagation) event.stopPropagation();
        this.setState({
            anchorEl: null,
        });
    };

    handleColorChange = (color: { hex: string }) => {
        this.setState({ color: color.hex }, () => {
            // The && here is to keep the TS compiler happy. If isCustomEvent is true, there should always be a customEventID passed to props.
            if (this.props.isCustomEvent && this.props.customEventID)
                changeCustomEventColor(this.props.customEventID, this.state.color);
            else if (this.props.sectionCode && this.props.term)
                changeCourseColor(this.props.sectionCode, this.props.term, this.state.color);
        });
    };

    updateColor = (color: string) => {
        if (color !== this.props.color) {
            this.setState({ color: color });
        }
    };

    componentDidMount = () => {
        let colorPickerId;
        if (this.props.isCustomEvent && this.props.customEventID) colorPickerId = this.props.customEventID.toString();
        else if (this.props.sectionCode) colorPickerId = this.props.sectionCode;
        else throw new Error("Colorpicker custom component wasn't supplied a custom event id or a section code.");
        AppStore.registerColorPicker(colorPickerId, this.updateColor);
    };
    componentWillUnmount = () => {
        let colorPickerId;
        if (this.props.isCustomEvent && this.props.customEventID) colorPickerId = this.props.customEventID.toString();
        else if (this.props.sectionCode) colorPickerId = this.props.sectionCode;
        else throw new Error("Colorpicker custom component wasn't supplied a custom event id or a section code.");
        AppStore.unregisterColorPicker(colorPickerId, this.updateColor);
    };

    render() {
        return (
            <>
                <IconButton
                    style={{ color: this.state.color }}
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
            </>
        );
    }
}

export default ColorPicker;
