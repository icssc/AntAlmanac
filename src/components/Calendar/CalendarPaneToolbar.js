import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import {IconButton, Tooltip, Typography} from "@material-ui/core";
import {ChevronLeft, ChevronRight, Undo} from "@material-ui/icons";
import ScreenshotButton from "./ScreenshotButton";
import PropTypes from "prop-types";
import Submenu from "./Submenu"

const styles = {
  toolbar: {
    display: 'flex',
    backgroundColor: "#dfe2e5",
    overflow: "auto",
    marginBottom: '4px',
    alignItems: 'center'
  },
  inline: {
    display: 'inline'
  },
  spacer: {
    flexGrow: '1'
  }
};

class CalendarPaneToolbar extends Component {
  render() {
    const {classes} = this.props;

    return (
      <div className={classes.toolbar}>
        <IconButton onClick={() => this.props.onScheduleChange(0)}>
          <ChevronLeft fontSize='small'/>
        </IconButton>
        <Typography variant="subheading" className={classes.inline}>
          {'Schedule ' + (this.props.currentScheduleIndex + 1)}
        </Typography>
        <IconButton onClick={() => this.props.onScheduleChange(1)}>
          <ChevronRight fontSize='small'/>
        </IconButton>

        <div className={classes.spacer}> </div>

        <Tooltip title="Undo Last Delete">
          <IconButton onClick={() => this.props.onUndo(null)}>
            <Undo fontSize='small'/>
          </IconButton>
        </Tooltip>

        <ScreenshotButton onTakeScreenshot={this.props.onTakeScreenshot}/>

        <Tooltip title="More">
          <Submenu
            onAddCustomEvent={this.props.onAddCustomEvent}
            onClearSchedule={this.props.onClearSchedule}
            onTakeScreenshot={this.props.onTakeScreenshot}
          />
        </Tooltip>
      </div>
    )
  }
}

CalendarPaneToolbar.propTypes = {
  onScheduleChange: PropTypes.func,
  onClearSchedule: PropTypes.func,
  onUndo: PropTypes.func,
  onAddCustomEvent: PropTypes.func,
  onTakeScreenshot: PropTypes.func,
  currentScheduleIndex: PropTypes.number
};

export default withStyles(styles)(CalendarPaneToolbar);
