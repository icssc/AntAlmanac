import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Popover,
  InputLabel,
  Input,
  FormControl,
} from '@material-ui/core';
import SMS from './smsInput';
import { askForPermissionToReceiveNotifications } from '../../push-notification';

const styles = (theme) => ({
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
    userEmail: '',
    addEmailMessageOn: false,
    addPushMessageOn: false,
    isRegistered: false,
    cacheSMS: '(  )    -    ',
    cachePushToken: '',
    open: false,
  };

  handleClick = (event) => {
    if (!event) event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();
    let email = '';
    let sms = '(  )    -    ';
    let token = '';
    if (typeof Storage !== 'undefined') {
      email = window.localStorage.getItem('email');
      sms = window.localStorage.getItem('sms');
      token = window.localStorage.getItem('token');
    }

    this.setState({
      anchorEl: event.currentTarget,
      userEmail: email,
      cacheSMS: sms,
      cachePushToken: token,
    });
  };

  handleClose = (event) => {
    if (!event) event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();
    this.setState({
      anchorEl: null,
    });
  };

  /* Signs email up to receive notifications */
  getMeSpotEmail = () => {
    const code = this.props.code;
    const email = this.state.userEmail;
    const name = this.props.name[1] + ' ' + this.props.name[2];

    let url =
      'https://3jbsyx3se1.execute-api.us-west-1.amazonaws.com/dev/email/';

    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(email)) {
    } else {
      url = url + code + '/' + name + '/' + email;
      window.localStorage.setItem('email', email);
      fetch(url);
      this.setState({ addEmailMessageOn: true });
    }
    // url = url + code +"/"+ name + "/" + email;
    // window.localStorage.setItem("email", email);
    // this.handleClose();
    // this.props.handleSave()
    // fetch(url)
    // alert(email+" added to the notification list for "+ code +" !!!")
  };

  /* Signs up the specific device to receive notifications using token */
  getMeSpotPush = () => {
    const code = this.props.code;
    const token = this.state.cachePushToken;
    const name = this.props.name[1] + ' ' + this.props.name[2];

    let url =
      'https://3jbsyx3se1.execute-api.us-west-1.amazonaws.com/dev/pushnotif/';

    url = url + code + '/' + name + '/' + token;
    fetch(url);
    this.setState({ addPushMessageOn: true });
  };

  /* Caches token and closes popover */
  getPushToken = async () => {
    const token = await askForPermissionToReceiveNotifications(); //get push token
    window.localStorage.setItem('token', token); //cache token
    this.setState({ cachePushToken: token }); //save token in state
    fetch(
      'https://3jbsyx3se1.execute-api.us-west-1.amazonaws.com/dev/testpush/' +
        token
    ); //test push notif
  };

  inputChange = (event) => {
    if (!event) event = window.event;
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();
    this.setState({ userEmail: event.target.value });
  };

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
          onClick={(event) => {
            if (!event) event = window.event;
            event.cancelBubble = true;
            if (event.stopPropagation) event.stopPropagation();
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Typography className={classes.typography}>
            Get notified when a spot opens!
          </Typography>

          {/* Added Messages */}
          {this.state.addEmailMessageOn ? (
            <Typography className={classes.typography}>
              <p>
                <font color="green">Added email to watchlist!!!</font>
              </p>
            </Typography>
          ) : null}

          {this.state.addPushMessageOn ? (
            <Typography className={classes.typography}>
              <p>
                <font color="green">Added device to watchlist!!!</font>
              </p>
            </Typography>
          ) : null}

          <div className={classes.container}>
            {/* Email Notifications */}
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="formatted-email-input">
                Enter email:
              </InputLabel>
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
            <Button
              variant="text"
              color="primary"
              className={classes.button}
              onClick={this.getMeSpotEmail}
            >
              Add
            </Button>

            {/* SMS Notifications */}
            <SMS
              code={this.props.code}
              cacheSMS={this.state.cacheSMS}
              name={this.props.name}
            />

            {/* Push Notifications */}
            <FormControl
              className={classes.container}
              style={{ width: '100%' }}
            >
              <Typography color="inherit" style={{ marginLeft: 10 }}>
                Push Notification
              </Typography>
              <div
                style={{
                  display: 'inline-flex',
                  width: '100%',
                }}
              >
                <Button
                  onClick={() => this.setState({ open: true })}
                  color="inherit"
                  style={{ flexGrow: 1 }}
                >
                  Help
                </Button>
                {this.state.cachePushToken === null ? (
                  <Button
                    variant="text"
                    color="primary"
                    className={classes.button}
                    onClick={this.getPushToken}
                  >
                    Register Device
                  </Button>
                ) : (
                  <div>
                    <Button
                      variant="text"
                      className={classes.button}
                      onClick={() => {
                        fetch(
                          'https://3jbsyx3se1.execute-api.us-west-1.amazonaws.com/dev/testpush/' +
                            this.state.cachePushToken
                        );
                      }}
                    >
                      Test
                    </Button>
                    <Button
                      variant="text"
                      color="primary"
                      className={classes.button}
                      onClick={this.getMeSpotPush}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </FormControl>
          </div>
        </Popover>

        {/*Instructions for using push notification*/}
        <Dialog
          open={this.state.open}
          onClose={() => {
            this.setState({ open: false });
          }}
          aria-labelledby="alert-dialog"
          aria-describedby="alert-dialog-desc"
        >
          <DialogTitle id="alert-dialog-title">
            {'Paul Revere Push Notifications'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <p>
                Sign up for push notifs on the device with which you intend to
                receive them. On Android phones, please add AntAlmanac to the
                homescreen for this to work.
              </p>

              <p>
                After you register, you should get a test notif. If you do not,
                then your browser/device might not support push notifications.
                For example, iOS dvices do not support push notifications, but
                Mac computers do.
              </p>

              <p>
                After receiving your test push, add yourself to the watchlist.
              </p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({ open: false });
              }}
              color="primary"
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

SPopover.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SPopover);
