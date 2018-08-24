import React from 'react';
import EventName from "../EventName/EventName";
import DaySelector from "../DaySelector/DaySelector";
import DropdownMenu from "../DropdownMenu/DropdownMenu";
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
});

class DialogSelect extends React.Component {
  state = {
    open: false,
    hour: '',
    minute: '',
    meridiem: ''
  };

  handleChange = event => {
    this.setState({ [event.target.value]: Number(event.target.value) });
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handlClick = () => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleClose2 = () => {
    this.setState({ anchorEl: null });;
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Button onClick={this.handleClickOpen} variant="contained" color="primary">Add Custom Event</Button>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          open={this.state.open}
          onClose={this.handleClose}
        >
          <DialogContent>
            <EventName/>
            <h5>Start:</h5>
            <DropdownMenu/>
            <h5>End:</h5>
            <DropdownMenu/>
            <DaySelector/>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
              aria-owns={anchorEl ? 'simple-menu' : null}
              aria-haspopup="true"
              onClick={this.handleClick}
            >
            Open Menu
            </Button>
            <Button onClick={this.handleClose} variant="contained" color="primary">
              Add to Calendar
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleClose2}
            >
              <MenuItem onClick={this.handleClose2}>Profile</MenuItem>
              <MenuItem onClick={this.handleClose2}>My account</MenuItem>
              <MenuItem onClick={this.handleClose2}>Logout</MenuItem>
            </Menu>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

DialogSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DialogSelect);
