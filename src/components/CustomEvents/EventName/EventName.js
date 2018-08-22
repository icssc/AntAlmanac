import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import CalendarToday from "@material-ui/icons/CalendarToday";

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  margin: {
    margin: theme.spacing.unit,
  },
  withoutLabel: {
    marginTop: theme.spacing.unit * 3,
  },
  textField: {
    flexBasis: 200,
  },
});

class EventName extends React.Component {
 constructor(props){
     super(props);
  
    }
  handleChange = (event) => {
    const val =  event.target.value            
      //  this.setState((state) => state.person[event.target.name] = newValue);
      this.setState({value:val});
    console.log(event.target.value,"from TEXTFIELD");
    console.log(this.props,"PROPS");
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <TextField
          value ={this.props.value}
          onChange={this.handleChange.bind(this)}
          placeholder="Event Name"
          id="simple-start-adornment"
          className={classNames(classes.margin, classes.textField)}
          InputProps=
                    {{ startAdornment: <InputAdornment position="start">
                        <CalendarToday/>
                        </InputAdornment>,
                    }}
        />   
      </div>
    );
  }
}

EventName.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EventName);