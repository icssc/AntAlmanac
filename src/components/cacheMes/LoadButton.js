import React, { Component, Fragment } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';

export default class LoadDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      name: null,
      checked: true,
    };
  }

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = (wasCancelled) => {
    if (wasCancelled) this.setState({ open: false });
    else
      this.setState({ open: false }, () => {
        this.props.handleLoad(this.state.name, this.state.checked);
      });
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleEnterButtonPressed, false);
  }

  componentWillUnmount() {
    document.addEventListener('keydown', this.handleEnterButtonPressed, false);
  }

  handleEnterButtonPressed = (event) => {
    const charCode = event.which ? event.which : event.keyCode;

    if (
      (charCode === 13 || charCode === 10) &&
      document.activeElement.id === 'name'
    ) {
      event.preventDefault();
      this.setState({ open: false }, () => {
        this.props.handleLoad(this.state.name, this.state.checked);
      });

      return false;
    }
  };

  setUserID = (event) => {
    this.setState({ name: event.target.value });
  };

  //Switches checkbox value
  handleCheckboxChange = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
  };

  render() {
    return (
      <div>
        <Button onClick={this.handleOpen} color="inherit">
          <CloudDownload />
          {this.props.isDesktop ? (
            <Typography color="inherit">&nbsp;&nbsp;LOAD</Typography>
          ) : (
            <Fragment />
          )}
        </Button>
        <Dialog open={this.state.open} onClose={() => this.handleClose(true)}>
          <DialogTitle id="form-dialog-title">Load</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter your username here to load your schedules.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="User ID"
              type="text"
              fullWidth
              placeholder="Enter here:"
              onChange={this.setUserID}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.checked}
                  onChange={this.handleCheckboxChange('checked')}
                  value={this.state.checked}
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              }
              label="Remember Me (Uncheck on shared computers)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.handleClose(true)} color="primary">
              Cancel
            </Button>
            <Button onClick={() => this.handleClose(false)} color="primary">
              Load
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
