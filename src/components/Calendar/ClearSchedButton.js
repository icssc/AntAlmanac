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
import green from '@material-ui/core/colors/green';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';

export default class ClearSched extends React.Component {
  
  state = {
    open: false,
    all: false,
    one: false,
    two: false,
    three: false,
    four: false
  };

  checkboxState = () => { 
    checked: false
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({
      open: false,
      all: false,
      one: false,
      two: false,
      three: false,
      four: false})
  }

  handleClear = () => {
    let Keep = [];

    if (this.state.one){
      Keep.push(0)
    }
    if (this.state.two){
      Keep.push(1)
    }
    if (this.state.three){
      Keep.push(2)
    }
    if (this.state.four){
      Keep.push(3)
    }
    
    console.log(Keep)
    this.props.handleClearSchedule(Keep)
    this.handleClose()
  }

  handleChange = name => event => {
    if (name==='all'){
      this.setState({
        all: event.target.checked,
        one: event.target.checked,
        two: event.target.checked,
        three: event.target.checked,
        four: event.target.checked
      })
    }
    this.setState({ [name]: event.target.checked });
  };
  
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
              <FormGroup>
              <FormControlLabel
                control={
                <CheckBox 
                  checked={this.state.all} onChange={this.handleChange('all')}
                />
                }
                value="all"
                label="Clear All"
              />
              <FormControlLabel
                control={
                <CheckBox 
                  checked={this.state.one} onChange={this.handleChange('one')}
                />
                }
                value="one"
                label="Schedule 1"
                color="primary"
              />
              <FormControlLabel
                control={
                <CheckBox 
                  checked={this.state.two} onChange={this.handleChange('two')}
                />
                }
                value="two"
                label="Schedule 2"
              />
              <FormControlLabel
                control={
                <CheckBox 
                  checked={this.state.three} onChange={this.handleChange('three')}
                />
                }
                value="three"
                label="Schedule 3"
              />
              <FormControlLabel
                control={
                <CheckBox 
                  checked={this.state.four} onChange={this.handleChange('four')}
                />
                }
                value="four"
                label="Schedule 4"
              />
              
              </FormGroup>
            </div>
              </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleClear} color="primary"> Clear 
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}