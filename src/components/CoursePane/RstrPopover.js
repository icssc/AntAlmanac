import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import code_lookup from './restrictions.json';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing.unit,
  },
});

class RstrPopover extends React.Component {
  state = {
    anchorEl: null,
  };

  handlePopoverOpen = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handlePopoverClose = () => {
    this.setState({ anchorEl: null });
  };

  parseRstr = (rstr) => {
    const explained = [];
    for (let code of rstr.split(' ')) {
      if (code !== 'and' && code !== 'or') {
        explained.push(code_lookup[code]);
      }
    }
    return explained;
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div>
        <Typography
          onMouseEnter={this.handlePopoverOpen}
          onMouseLeave={this.handlePopoverClose}
        >
          <a
            href="https://www.reg.uci.edu/enrollment/restrict_codes.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            {this.props.restrictions}
          </a>
        </Typography>
        <Popover
          id="rstr-popover"
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
            {this.parseRstr(this.props.restrictions).map((r) => (
              <Fragment key={r}>
                {r}
                <br />
              </Fragment>
            ))}
          </Typography>
        </Popover>
      </div>
    );
  }
}

RstrPopover.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RstrPopover);
