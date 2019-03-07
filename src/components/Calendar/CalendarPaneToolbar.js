import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {IconButton, Paper, Toolbar, Tooltip, Typography} from "@material-ui/core";
import {ChevronLeft, ChevronRight, Undo} from "@material-ui/icons";
import ScreenshotButton from "./ScreenshotButton";
import PropTypes from "prop-types";
import Submenu from "./Submenu"

const styles = {
    toolbarContainer: {
        overflow: "auto",
        marginBottom: '8px'
    },
    toolbar: {
        backgroundColor: "#dfe2e5",
        borderRadius: 0
    }
};

class CalendarPaneToolbar extends Component {
    render() {
        const {classes} = this.props;

        return (
            <Paper elevation={0} className={classes.toolbarContainer}>
                <Toolbar variant="dense" className={classes.toolbar}>
                    <IconButton onClick={() => this.props.onScheduleChange(0)}>
                        <ChevronLeft/>
                    </IconButton>
                    <Typography variant="subheading">
                        {'Schedule ' + (this.props.currentScheduleIndex + 1)}
                    </Typography>
                    <IconButton onClick={() => this.props.onScheduleChange(1)}>
                        <ChevronRight/>
                    </IconButton>
                    <Typography style={{flexGrow: 1}}/>

                    <Tooltip title="Undo Last Delete">
                        <IconButton onClick={() => this.props.onUndo(null)}>
                            <Undo/>
                        </IconButton>
                    </Tooltip>

                    <ScreenshotButton onTakeScreenshot={this.props.onTakeScreenshot}/>

                    <Tooltip title="More">
                        <Submenu
                          onAddCustomEvent={this.props.onAddCustomEvent}
                          setID={this.props.setID}
                          onClearSchedule={this.props.onClearSchedule}
                          onTakeScreenshot={this.props.onTakeScreenshot}
                        />
                      </Tooltip>
                </Toolbar>
            </Paper>
        )
    }
}

CalendarPaneToolbar.propTypes = {
    onScheduleChange: PropTypes.func,
    onClearSchedule: PropTypes.func,
    onUndo: PropTypes.func,
    setID: PropTypes.func,
    onAddCustomEvent: PropTypes.func,
    onTakeScreenshot: PropTypes.func,
    currentScheduleIndex: PropTypes.number
};

export default withStyles(styles)(CalendarPaneToolbar);
