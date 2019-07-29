import React, { Fragment } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Typography,
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';

export default class ClearSched extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      all: false,
      one: this.props.currentScheduleIndex === 0,
      two: this.props.currentScheduleIndex === 1,
      three: this.props.currentScheduleIndex === 2,
      four: this.props.currentScheduleIndex === 3,
    };
  }

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
      four: false,
    });
    this.props.handleSubmenuClose();
  };

  handleClear = () => {
    let toDelete = [];

    if (this.state.one) {
      toDelete.push(0);
    }
    if (this.state.two) {
      toDelete.push(1);
    }
    if (this.state.three) {
      toDelete.push(2);
    }
    if (this.state.four) {
      toDelete.push(3);
    }

    this.props.handleClearSchedule(toDelete);
    this.handleClose();
  };

  handleChange = (name) => (event) => {
    if (name === 'all') {
      this.setState({
        all: event.target.checked,
        one: event.target.checked,
        two: event.target.checked,
        three: event.target.checked,
        four: event.target.checked,
      });
    } else {
      this.setState({ [name]: event.target.checked });
    }
  };

  render() {
    return (
      <Fragment>
        <Button
          onClick={this.handleClickOpen}
          disableRipple={true}
          style={{ width: '100%' }}
          className={'menu-button'}
        >
          <Delete /> Clear
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            Select a Schedule to Clear
          </DialogTitle>
          <DialogContent>
            <div>
              <Typography variant="subheading">
                You cannot undo this action,
                <br />
                but you can load your schedule again.
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.all}
                      onChange={this.handleChange('all')}
                    />
                  }
                  value="all"
                  label="Clear All"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.one}
                      onChange={this.handleChange('one')}
                    />
                  }
                  value="one"
                  label="Schedule 1"
                  color="primary"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.two}
                      onChange={this.handleChange('two')}
                    />
                  }
                  value="two"
                  label="Schedule 2"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.three}
                      onChange={this.handleChange('three')}
                    />
                  }
                  value="three"
                  label="Schedule 3"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.four}
                      onChange={this.handleChange('four')}
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
            <Button
              onClick={this.handleClear}
              style={{ backgroundColor: '#72a9ed', boxShadow: 'none' }}
            >
              Clear
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}
