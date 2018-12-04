import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Input from '@material-ui/core/Input';

const styles = theme => ({
  typography: {
    margin: theme.spacing.unit * 2,
  },
});

class SPopover extends React.Component {
  state = {
    anchorEl: null,
    userEmail:""
  };


  handleClick = event => {
    if (!event)  event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();
    var email ="";
    if (typeof Storage !== "undefined") {
         email = window.localStorage.getItem("email");
      }
      
      this.setState({ anchorEl: event.currentTarget,userEmail: email });
    
  };

  handleClose = (event) => {
    if (!event) var event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();
    this.setState({
      anchorEl: null,
    });
  };

  getMeSpot = () =>{
    const code = this.props.code;
    const email = this.state.userEmail;
    const name = this.props.name[1] + " " + this.props.name[2]
   

    let url = "https://mediaont.herokuapp.com/"

    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(email))
    this.setState({
        anchorEl: null,
      },()=>{
      this.props.handleSave(-1,email,code)});
    else
    {
        url = url + code +"/"+ name + "/" + email;
        window.localStorage.setItem("email", email);
        this.setState({
            anchorEl: null,
          },()=>{
            fetch(url)
            this.props.handleSave(1,email,code);
          });
    }
    // url = url + code +"/"+ name + "/" + email;
    // window.localStorage.setItem("email", email);
    // this.handleClose();
    // this.props.handleSave()
    // fetch(url)
    // alert(email+" added to the notification list for "+ code +" !!!")
  }
  inputChange = (event) =>{
    if (!event)  event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();
    this.setState({userEmail: event.target.value})
  }
  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <React.Fragment>
       
        <Button
          aria-owns={open ? 'simple-popper' : undefined}
          aria-haspopup="true"
          variant="outlined"
          color="inherit"
          className={'multiline'}
          onClick={this.handleClick}
        >
         {this.props.full}
        </Button>
        <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          onClick={event=>{if (!event) var event = window.event;
            event.cancelBubble = true;
            if (event.stopPropagation) event.stopPropagation();}}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Typography className={classes.typography}>Get notified when  a spot opens!</Typography>
          
          <div className={classes.container}>
      
         
          <Input
           style={{ margin: 10 }}
            onChange={this.inputChange}
            placeholder="Email"
            className={classes.input}
            defaultValue={this.state.userEmail}

            inputProps={{
              'aria-label': 'Description',
            }}
          />
   
          <Button variant="text" color="primary" className={classes.button} onClick={this.getMeSpot}>
            Add</Button>
           
        </div>

        </Popover>
      </React.Fragment>
    );
  }
}

SPopover.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SPopover);