import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Delete from '@material-ui/icons/Delete'
import CheckBox from '@material-ui/core/Checkbox'
export default class ClearSched extends React.Component {
  
  state = {
    open: false,
  };

  checkboxState = () => { 
    checked: false
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleCheckboxChange = event =>
    this.setState({ checked: event.target.checked 
  });
  
    render() {
    return (
      <div>
        <Button onClick={this.handleClickOpen}>
          <Delete /> Clear Classes
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Select a Schedule to Clear</DialogTitle>
          <DialogContent>
            <div>
              <label>
              <CheckBox onChange={true}/> Clear All <br />
              <CheckBox onChange={true}/> Schedule 1 <br />
              <CheckBox onChange={true}/> Schedule 2 <br />
              <CheckBox onChange={true}/> Schedule 3 <br />
              <CheckBox onChange={true}/> Schedule 4
              </label>
            </div>
              </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button color="tertiary"> Clear 
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}