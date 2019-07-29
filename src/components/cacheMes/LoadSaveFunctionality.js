import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Error, Close, Warning } from '@material-ui/icons';
import { green, amber } from '@material-ui/core/colors';
import { IconButton, Snackbar, SnackbarContent } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { loadUserData } from '../App/FetchHelper';
import LoadButton from './LoadButton';
import SaveButton from './SaveButton';

const iconVariants = {
  success: CheckCircle,
  warning: Warning,
  error: Error,
};

const snackbarStyles = (theme) => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
});

const SnackBarMessageDisplay = withStyles(snackbarStyles)((props) => {
  const { classes, message, onClose, variant, ...other } = props;
  const Icon = iconVariants[variant];

  return (
    <SnackbarContent
      className={classes[variant]}
      message={
        <span className={classes.message}>
          <Icon className={classes.icon} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          color="inherit"
          className={classes.close}
          onClick={onClose}
        >
          <Close className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  );
});

SnackBarMessageDisplay.propTypes = {
  classes: PropTypes.object,
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
};

class LoadSaveScheduleFunctionality extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      variant: 'success',
    };
  }

  componentDidMount = async () => {
    if (typeof Storage !== 'undefined') {
      const savedUserID = window.localStorage.getItem('userID');
      if (savedUserID != null) {
        const userData = await loadUserData(savedUserID); // this shit gotta do promise joint
        const allowSchedToUpload =
          window.localStorage.getItem('allowScheduleUpload') === 'true';
        if (userData !== -1 && allowSchedToUpload) {
          if (!userData.canceledClass) {
            this.setState({
              message:
                'Schedule that was saved under ' + savedUserID + ' loaded.',
              open: true,
              variant: 'success',
            });
          } else
            this.setState({
              message:
                'Schedule that was saved under ' +
                savedUserID +
                ' loaded; however, one or more classes have been cancelled!',
              variant: 'warning',
              open: true,
            });

          await this.props.onLoad(userData);
        }
      }
    }
  };

  handleLoad = async (userID, allowScheduleUpload) => {
    if (userID != null) {
      userID = userID.replace(/\s+/g, '');

      if (userID.length > 0) {
        const userData = await loadUserData(userID);
        window.localStorage.setItem('allowScheduleUpload', allowScheduleUpload);
        // console.log(allowScheduleUpload);
        if (userData !== -1) {
          let message = '';
          let variant = '';

          if (!userData.canceledClass) {
            message = "Schedule that was saved under '" + userID + "' loaded.";
            variant = 'success';
          } else {
            message =
              'Schedule that was saved under ' +
              userID +
              ' loaded; however, one or more classes have been cancelled!!!';
            variant = 'warning';
          }

          this.setState(
            {
              open: true,
              message: message,
              variant: variant,
            },
            async () => {
              this.props.onLoad(userData);
              window.localStorage.setItem('userID', userID);
            }
          );
        } else {
          this.setState({
            open: true,
            message: "No schedule found for username '" + userID + "'.",
            variant: 'warning',
          });
        }
      }
    }
  };

  handleSave = async (userID, allowScheduleUpload) => {
    if (userID != null) {
      userID = userID.replace(/\s+/g, '');

      if (userID.length > 0) {
        try {
          await this.props.onSave(userID);

          this.setState({
            variant: 'success',
            open: true,
            message:
              "Schedule saved under username '" +
              userID +
              "'! Remember that you still need to register for courses through WebReg.",
          });
          window.localStorage.setItem('userID', userID);
          window.localStorage.setItem(
            'allowScheduleUpload',
            allowScheduleUpload
          );
        } catch (err) {
          this.setState({
            open: true,
            message: "No schedule found for username '" + userID + "'.",
            variant: 'warning',
          });
        }
      }
    }
  };

  handleClose = (reason) => {
    if (reason !== 'clickaway') this.setState({ open: false });
  };

  render() {
    return (
      <Fragment>
        <LoadButton
          handleLoad={this.handleLoad}
          isDesktop={this.props.isDesktop}
        >
          {' '}
        </LoadButton>
        <SaveButton
          handleSave={this.handleSave}
          isDesktop={this.props.isDesktop}
        />
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={this.state.open}
          autoHideDuration={4000}
          onClose={this.handleClose}
        >
          <SnackBarMessageDisplay
            onClose={this.handleClose}
            variant={this.state.variant}
            message={this.state.message}
          />
        </Snackbar>
      </Fragment>
    );
  }
}

export default LoadSaveScheduleFunctionality;
