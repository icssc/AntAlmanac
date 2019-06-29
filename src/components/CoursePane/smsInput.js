import React from 'react';
import MaskedInput from 'react-text-mask';
import NumberFormat from 'react-number-format';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = (theme) => ({
  typography: {
    margin: theme.spacing.unit * 2,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
  },
});

function TextMaskCustom(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[
        '(',
        /[1-9]/,
        /\d/,
        /\d/,
        ')',
        ' ',
        /\d/,
        /\d/,
        /\d/,
        '-',
        /\d/,
        /\d/,
        /\d/,
        /\d/,
      ]}
      placeholderChar={'\u2000'}
      showMask
    />
  );
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
};

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      thousandSeparator
      prefix="$"
    />
  );
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

class FormattedInputs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textmask: this.props.cacheSMS,
      numberformat: '1320',
      smsOn: false,
      number: 0,
    };
  }
  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  getMeSpotSMS = () => {
    const code = this.props.code;
    const name = this.props.name[1] + ' ' + this.props.name[2];
    let regex = /\d+/g;
    let matches = this.state.textmask.match(regex);
    matches = matches.join('');

    if (matches > 999999999) {
      this.setState({ smsOn: true }, () => {
        window.localStorage.setItem('sms', this.state.textmask);
        fetch(
          'https://3jbsyx3se1.execute-api.us-west-1.amazonaws.com/dev/sms/' +
            code +
            '/' +
            name +
            '/' +
            matches
        );
      });
      if (window.localStorage.getItem('sms') === null) {
        this.setState({ open: true });
      }
    }
  };

  render() {
    const { classes } = this.props;
    const { textmask } = this.state;

    return (
      <React.Fragment>
        {this.state.smsOn ? (
          <Typography className={classes.typography}>
            {' '}
            <p>
              <font color="green">Added number to watchlist!!!</font>
            </p>
          </Typography>
        ) : null}
        <div className={classes.container}>
          <div className={classes.container} />
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="formatted-text-mask-input">
              Enter phone number:
            </InputLabel>
            <Input
              value={textmask}
              onChange={this.handleChange('textmask')}
              id="formatted-text-mask-input"
              inputComponent={TextMaskCustom}
            />
          </FormControl>
          <Button
            variant="text"
            color="primary"
            className={classes.button}
            onClick={this.getMeSpotSMS}
          >
            Add
          </Button>
        </div>

        <Dialog
          open={this.state.open}
          onClose={() => {
            this.setState({ open: false });
          }}
          aria-labelledby="alert-dialog"
          aria-describedby="alert-dialog-desc"
        >
          <DialogTitle id="alert-dialog-title">
            {'SMS Paul Revere Notifications'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <p>
                Did you know that sending text messages is really expensive?
                Well it is, and we really don't want to put any of our features
                behind a pay wall.
              </p>

              <p>
                This is why instead, we are asking you for a simple favor:
                please share our app with someone! If you like what we do and
                want us to do more of what we do, please like and share our{' '}
                <a
                  href="https://facebook.com/AntAlmanac"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook Page
                </a>
                !
              </p>

              <p>
                Or please provide us with a small piece of feedback using our{' '}
                <a
                  href="https://goo.gl/forms/4Q41TmjObbOCeK7Z2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  feedback form
                </a>
                !
              </p>

              <p>
                Because we don't like to monitor our users like Facebook does,
                this is an honor system! We cannot keep bringing you new
                features without your love and support!!! Thank you!
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
              Done!
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

FormattedInputs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FormattedInputs);
