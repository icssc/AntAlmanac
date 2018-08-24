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
  constructor()
  {
    super();
    this.state = {
      open: false,
      start: '07:30',
      end: '07:30',
      eventName:'None',
      day:[]
    };
    this.handleChange = this.handleChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  //chose a calinder
  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

handleChange = e => {
  this.setState({ eventName:e.target.value });
 }

endTimeHandler = event => {this.setState({ end: event.target.value });}

startTimeHandler = event => {this.setState({ start: event.target.value });}

daysHandler = (selectedDays) =>{
  this.setState({ day: selectedDays });
}

/*daysHandler = (event) => {
  // checkBos is a copy of stat.day so we do it change state imm
  // get the current days, if the new value true add, else remove it if exitst
  console.log(event, "DATA FROM CHILD")
  let checkBox = [...this.state.day];
  // store the days for the newevent
  let newDays = [];
  if(event.target.checked)
  {
     checkBox = checkBox.concat(event.target.value) ;
     newDays = newDays.concat(event.target.value) ;
    
  }
  else
  {
   let index = checkBox.indexOf(event.target.value);
    if(index !== -1)
      checkBox.splice(index, 1);
    
  }
  // manydays used in onClick to create events for slected days
  this.setState({ manyDays: newDays });

  this.setState({ day: checkBox });
}
*/

  openCloseHandle = () => {
    const open = !this.state.open;
    this.setState({ open });
  };

  onClick() {
    // slicing according to the time str from state.start and state.end
  /// pasre str to int it's not required but new Date take int as param for better result
    const startHour =  parseInt(this.state.start.slice(0, 2));
    const startMin =   parseInt(this.state.start.slice(3, 5));
    const endHour = parseInt(this.state.end.slice(0, 2));
    const endMin = parseInt(this.state.end.slice(3, 5));
    
    const obj = []
    this.state.day.forEach(element => {
      const addCalender = {
        color: 'black',
        title: this.state.eventName,
        start: new Date(2018, 0, element, startHour, startMin),
        end: new Date(2018, 0,  element, endHour, endMin),
       }
       obj.push(addCalender);
    });
    
    this.props.callback(obj);
    // close the pop up after creating obj
    this.openCloseHandle()
}
  render() {

    const { anchorEl } = this.state;
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
    return (
      <div>
        <Button style={style} onClick={this.openCloseHandle} variant="contained" ><AddIcon/>Event</Button>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          open={this.state.open}
          onClose={this.openCloseHandle}>  

          <DialogContent>

            <EventName value={this.state.eventName} userEventName={this.handleChange}/>
            <TimePickers label="Start Time" userTime={this.startTimeHandler} /> 
            <TimePickers label="End Time"   userTime={this.endTimeHandler} />
            
            <DaySelector userTime={this.daysHandler}/>

          </DialogContent>

          <DialogActions>
            <Button onClick={this.openCloseHandle} color="primary">
              Cancel
            </Button>
            <Button
              aria-owns={anchorEl ? 'simple-menu' : null}
              aria-haspopup="true"
              //onClick={this.handleClick}
               onClick={this.onClick}
              variant="contained" 
              color="primary"
            >
              Add to
            </Button>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleClose}
            >
              <MenuItem onClick={this.handleClose}>All Schedules</MenuItem>
              <MenuItem onClick={this.handleClose}>Schedule 1</MenuItem>
              <MenuItem onClick={this.handleClose}>Schedule 2</MenuItem>
              <MenuItem onClick={this.handleClose}>Schedule 3</MenuItem>
              <MenuItem onClick={this.handleClose}>Schedule 4</MenuItem>
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
