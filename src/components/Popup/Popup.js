/*import React from 'react';
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
*/
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
            <Button onClick={this.onClick} variant="contained" color="primary">
              Add Event
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