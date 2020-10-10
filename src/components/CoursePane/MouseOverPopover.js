import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Popover, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class MouseOverPopover extends React.Component {
  state = {
    anchorEl: null,
    mouseInPopover: false,
  };

  handlePopoverOpen = (event) => {
    const oldTarget = event.currentTarget;
    this.setState({ mouseInPopover: true });
    setTimeout(() => {
      if (this.state.mouseInPopover) this.setState({ anchorEl: oldTarget });
    }, 700);
  };

  handlePopoverClose = () => {
    this.setState({ anchorEl: null, mouseInPopover: false });
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <Fragment>
        <Typography
          aria-owns={open ? 'mouse-over-popover' : undefined}
          aria-haspopup="true"
          onMouseEnter={this.handlePopoverOpen}
          onMouseLeave={this.handlePopoverClose}
          className={this.props.className}
        >
          {this.props.children}
        </Typography>
        <Popover
          id="mouse-over-popover"
          className={classes.popover}
          classes={{
            paper: classes.paper,
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          onClose={this.handlePopoverClose}
          disableRestoreFocus
        >
          <Typography>
            Enrolled/Capacity
            <br />
            Waitlist
            <br />
            New Only Reserved
          </Typography>
        </Popover>
      </Fragment>
    );
  }
}

MouseOverPopover.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MouseOverPopover);
