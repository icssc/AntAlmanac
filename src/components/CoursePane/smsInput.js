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

const styles = theme => ({
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
      ref={ref => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
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
      onValueChange={values => {
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
        textmask: '(  )    -    ',
        numberformat: '1320',
        smsOn:false,
        number :0
      };
  }
  handleChange = name => event => {
      console.log("dsda",event.target.value,name);
    this.setState({
      [name]: event.target.value,
      number: event.target.value
    });
  };

  getMeSpotSMS =() =>
  {
    const code = this.props.code;
    const name = this.props.name[1] + " " + this.props.name[2];
    console.log(this.state.number,"dsdscccc");
    var regex = /\d+/g;
var matches = this.state.number.match(regex);
 matches = matches.join('');

      if(matches>999999999)
        this.setState({smsOn:true},()=>{fetch("https://pxvtmbq17a.execute-api.us-west-1.amazonaws.com/dev/sms/"+code+"/"+name+"/"+matches)});
  }

  render() {
    const { classes } = this.props;
    const { textmask } = this.state;

    return (
        <div>       {this.state.smsOn?( <Typography  className={classes.typography}> <p><font color="green">Added phone to watch list!!!</font></p></Typography>):(null)}
       
      <div className={classes.container}>
          <div className={classes.container}></div>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="formatted-text-mask-input">react-text-mask</InputLabel>
          <Input
            value={textmask}
            onChange={this.handleChange('textmask')}
            id="formatted-text-mask-input"
            inputComponent={TextMaskCustom}
          />
          
        </FormControl>
        <Button variant="text" color="primary" className={classes.button} onClick={this.getMeSpotSMS}>
            Add</Button>
      </div>
      </div>
    );
  }
}

FormattedInputs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FormattedInputs);