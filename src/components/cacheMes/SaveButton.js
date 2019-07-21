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
import { Save } from '@material-ui/icons';

export default class FormDialog extends Component {
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
        this.props.handleSave(this.state.name, this.state.checked);
      });
  };

  componentDidMount() {
    if (typeof Storage !== 'undefined') {
      const user = window.localStorage.getItem('userID');
      if (user !== null) {
        this.setState({ name: user });
      }
    }

    document.addEventListener('keydown', this.enterEvent, false);
  }

  componentWillUnmount() {
    document.addEventListener('keydown', this.enterEvent, false);
  }

  enterEvent = (event) => {
    const charCode = event.which ? event.which : event.keyCode;

    if (
      (charCode === 13 || charCode === 10) &&
      document.activeElement.id === 'nameSave'
    ) {
      event.preventDefault();
      this.setState({ open: false }, () => {
        this.props.handleSave(this.state.name, this.state.checked);
      });

      return false;
    }
  };

  setName = (event) => {
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
          <Save />
          {this.props.isDesktop ? (
            <Typography color="inherit">&nbsp;&nbsp;Save</Typography>
          ) : (
            <Fragment />
          )}
        </Button>
        <Dialog open={this.state.open} onClose={() => this.handleClose(true)}>
          <DialogTitle id="form-dialog-title">Save</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter your username here to save your schedules.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="nameSave"
              label="User ID"
              type="text"
              fullWidth
              placeholder="Enter here"
              defaultValue={this.state.name}
              onChange={this.setName}
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
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
