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
import DatePicker from '../DatePicker/DatePicker';

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
      start: '',
      end: '',
      date: '',
      eventName:'None',
      day:[],
      anchorEl: null
    };
    this.addEventBtnClicked = this.addEventBtnClicked.bind(this);
  }
  //chose a calinder menu
 // handelScheduleNumber = (event) => { 
   // this.setState({ anchorEl: event.currentTarget });
  //};

  handleClose = (event) => {
    const calendarIndex = event.target.value;
    this.makeCalendarObj(calendarIndex);
    this.setState({ anchorEl: null });
    this.openCloseHandle();
  };

handleChange = e => {
  this.setState({ eventName:e.target.value });
 }

endTimeHandler = event => {this.setState({ end: event.target.value });}

startTimeHandler = event => {this.setState({ start: event.target.value });}
// legicty code no need for days slector ++++++++++++++++
daysHandler = (selectedDays) =>{
  this.setState({ day: selectedDays });
}
//+++++++++++++++++++++++++++++++++++++++++++++++
handleDatePicker = (e) =>{
  this.setState({ date: e.target.value });
}

  openCloseHandle = () => {
    const open = !this.state.open;
    this.setState({ open });
  };

  makeCalendarObj = (calendarIndex) =>
  {
    // slicing according to the time str from state.start and state.end
   // pasre str to int it's not required but new Date take int as param for better result
   /* let startHour =  parseInt(this.state.start.slice(0, 2));
    let startMin =   parseInt(this.state.start.slice(3, 5));
    let endHour = parseInt(this.state.end.slice(0, 2));
    let endMin = parseInt(this.state.end.slice(3, 5));
  
     1995-12-17T03:24:00 UTC FORMATW
    */
    //let d2 = new Date();
    //d2.setHours(endHour);
    //d2.setMinutes(endMin);
  //let old_wayStart =  new Date(2018, 7, element, startHour, startMin);
  //let old_wayEnd =  new Date(2018, 7,  element, endHour, endMin);
//*************************************************** */
    let date = this.state.date;
    let startDate = new Date(date+'T'+this.state.start);
    let endDate = new Date(date+'T'+this.state.end);
    console.log(startDate,endDate,'the date is '); 
    
    let obj = []
   
      let addCalender = {
        color: '#551a8b',
        title: this.state.eventName,
        start:startDate,
        end:endDate,
       } 
       obj.push(addCalender);
    
    // send it as proprs to handleCustomTime <popup/> in App.js 
    this.props.callback(obj,calendarIndex);
  }
  addEventBtnClicked(event) {
  this.setState({ anchorEl: event.currentTarget });  
}
  render() {
    console.log(this.state);
    const { anchorEl } = this.state;

    const style =
    {
      position: 'static',
      float:"right",
      opacity: '0.9',
      margin: '5px',
      width: "15%",
      height: "15",
      backgroundColor: "#42d9f4",
      borderRadius:'24%',
      color:'white',
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
            <DatePicker  userTime={this.handleDatePicker}/>

          </DialogContent>

          <DialogActions>
            <Button onClick={this.openCloseHandle} color="primary">
              Cancel
            </Button>
           
            <Button
              aria-haspopup="true"
              onClick={this.addEventBtnClicked}
              variant="contained" 
              color="primary" > Add Event</Button>
           
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.handleClose}>

              <MenuItem value={11} onClick={this.handleClose}>All Schedules</MenuItem>
              <MenuItem value={0} onClick={this.handleClose}>Schedule 1</MenuItem>
              <MenuItem value={1} onClick={this.handleClose}>Schedule 2</MenuItem>
              <MenuItem value={2} onClick={this.handleClose}>Schedule 3</MenuItem>
              <MenuItem value={3} onClick={this.handleClose}>Schedule 4</MenuItem>
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
