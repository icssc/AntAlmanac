import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default class FormDialog extends React.Component {
  state = {
    open: false
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleCloseYes = () => {
    this.setState({ open: false });
    this.props.save();
  };

  loginClicked = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <div>
        <Button onClick={this.handleClickOpen} color="inherit">
          Save
        </Button>
        <Dialog
          style={{
            marginBottom: "30%"
          }}
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">LogIn</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To save to this website, please enter your User ID here.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="User ID"
              type="text"
              fullWidth
              placeholder="Enter here"
              // call the parent function handle change
              onChange={e => this.props.act(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleCloseYes} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
