import React from 'react';
import DaySelector from "../DaySelector/DaySelector";
import TimePickers from "../DropdownMenu/DropdownMenu";
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import AddIcon from '@material-ui/icons/Add';
import EventName from '../EventName/EventName'

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

export const customEvent = () => {
  return( {
    color: 'blue',
    title: "title",
    start: new Date(2018, 0, 3, 8, 3),
    end: new Date(2018, 0, 3, 9, 44)
  })
};

class DialogSelect extends React.Component {
  constructor()
  {
    super();
    this.state = {
      open: false,
      calender: {hour: '', minute: '', meridiem: '',eventName:'Custom'}
    };
    this.handleChange = this.handleChange.bind(this);
    this.onClick = this.onClick.bind(this);
}

handleChange = e => {
  let eventName = this.state.calender.eventName;
  this.setState({ eventName:e.target.value });
 
}

  handleChangeList = event => {
    this.setState({ [event.target.value]: Number(event.target.value) });
    this.setState({ eventName: event.target.value });
  };

  openCloseHandle = () => {
    const open = !this.state.open;
    this.setState({ open });
  };

  onClick() {
    console.log(this.state,"state:");
    console.log(this.props,"props:");
}
  render() {
    const style =
    {
      position: 'fixed',
      zIndex: '10',
      opacity: '0.9',
      margin: '15px',
      width: "9%",
      height: "15",
      backgroundColor: "#42d9f4",
      borderRadius:'24%',
      color:'yellow',
    };
    const { classes } = this.props;

    return (
      <div>
        <Button style={style} onClick={this.openCloseHandle} variant="contained" ><AddIcon/>Event</Button>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          open={this.state.open}
          onClose={this.openCloseHandle}>  
          <DialogContent>

            <EventName value={this.state.eventName} onChange={this.props.handleChange}/>
            
            <TimePickers label="Start Time"/>
            <TimePickers label="End Time"/>
            <DaySelector/>
          </DialogContent>

          <DialogActions>
            <Button onClick={this.openCloseHandle} color="primary">
              Cancel
            </Button>
            <Button onClick={this.onClick} variant="contained" color="primary">
              Add to Calendar
            </Button>
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
