import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Input from '@material-ui/core/Input';
import SMS from "./smsInput"
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

const styles = theme => ({
  typography: {
    margin: theme.spacing.unit * 2,
  },
  formControl: {
    margin: theme.spacing.unit,
  },
});

class SPopover extends React.Component {
  state = {
    anchorEl: null,
    userEmail:"",
    addMessageOn:false,
    cacheSMS:"(  )    -    "
  };


  handleClick = event => {
    if (!event)  event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();
    var email ="";
    var sms ="(  )    -    ";
    if (typeof Storage !== "undefined") {
         email = window.localStorage.getItem("email");
         sms = window.localStorage.getItem("sms");
      }

      this.setState({ anchorEl: event.currentTarget,userEmail: email,cacheSMS:sms });

  };

  handleClose = event => {
    if (!event) event = window.event;
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


    let url = "https://3jbsyx3se1.execute-api.us-west-1.amazonaws.com/dev/email/"

        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(email))
     console.log("dd");
    else
    {
        url = url + code +"/"+ name + "/" + email;
        window.localStorage.setItem("email", email);
            fetch(url);
        this.setState({addMessageOn:true});

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
          onClick={event=>{if (!event) event = window.event;
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
          {this.state.addMessageOn?( <Typography  className={classes.typography}> <p><font color="green">Added email to watchlist!!!</font></p></Typography>):(null)}
          <div className={classes.container}>
          <FormControl className={classes.formControl}>

          <InputLabel htmlFor="formatted-email-input">Enter email:</InputLabel>
          <Input
            onChange={this.inputChange}
            placeholder="Email"
            className={classes.input}
            defaultValue={this.state.userEmail}
            id="formatted-email-input"
            inputProps={{
              'aria-label': 'Description',
            }}
          />
                  </FormControl>

          <Button variant="text" color="primary" className={classes.button} onClick={this.getMeSpot}>
            Add</Button>
            <SMS code={this.props.code} cacheSMS={this.state.cacheSMS} name={this.props.name}/>

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
