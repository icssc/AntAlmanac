/*import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const styles = {
  root: {
    color: green[600],
    "&$checked": {
      color: green[500]
    }
  },
  checked: {},
  size: {
    width: 40,
    height: 40
  },
  sizeIcon: {
    fontSize: 20
  }
};

class CheckboxLabels extends React.Component {
  state = {
    weekdays:
   [{monday: false},
    {tuesday: false},
    {wednesday: false},
    {thursday: false},
    {friday: false}]
  };

  handleChange = name => event => {
    let weekdays = [...this.state.weekdays]
    weekdays.forEach((elem) => {
      if(elem.hasOwnProperty(name))
      {
        elem[name]=event.target.checked;
      }
    })
    this.setState({ weekdays });
    console.log(this.state.weekdays)
   
  };

  render() {
    const { classes } = this.props;

    return (
      <FormGroup row onChange={this.props.userTime.bind(this, this.state.weekdays)}>
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.weekdays[0].monday}
              onChange={this.handleChange("monday")}
              value="1"
            />
          }
          label="Monday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.weekdays[1].tuesday}
              onChange={this.handleChange("tuesday")}
              value="2"
            />
          }
          label="Tuesday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.weekdays[2].wednesday}
              onChange={this.handleChange("wednesday")}
              value="3"
            />
          }
          label="Wednesday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.thursday}
              onChange={this.handleChange("thursday")}
              value="4"
            />
          }
          label="Thursday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.friday}
              onChange={this.handleChange("friday")}
              value="5"
            />
          }
          label="Friday"
        />
      </FormGroup>
    );
  }
}

CheckboxLabels.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckboxLabels);
*/


import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const styles = {
  root: {
    color: green[600],
    "&$checked": {
      color: green[500]
    }
  },
  checked: {},
  size: {
    width: 40,
    height: 40
  },
  sizeIcon: {
    fontSize: 20
  }
};

class CheckboxLabels extends React.Component {
  state = {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
   
  };

  update = (e) => {
    const selectedDays=[]
    if(e.target.checked){
      selectedDays.push([parseInt(e.target.value)])
    }

    if(this.state.monday)
    {
      selectedDays.push(1);
    }
    if(this.state.tuesday)
    {
      selectedDays.push(2);
    }
    if(this.state.wednesday)
    {
      selectedDays.push(3);
    }
    if(this.state.thursday)
    {
      selectedDays.push(4);
    }
    if(this.state.friday)
    {
      selectedDays.push(5);
    }
    console.log(selectedDays,'from child class')
    this.props.userTime(new Set(selectedDays));
  };

  render() {
    const { classes } = this.props;

    return (
      <FormGroup row onChange={this.update}>
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.monday}
              onChange={this.handleChange("monday")}
              value="1"
            />
          }
          label="Monday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.tuesday}
              onChange={this.handleChange("tuesday")}
              value="2"
            />
          }
          label="Tuesday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.wednesday}
              onChange={this.handleChange("wednesday")}
              value="3"
            />
          }
          label="Wednesday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.thursday}
              onChange={this.handleChange("thursday")}
              value="4"
            />
          }
          label="Thursday"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.friday}
              onChange={this.handleChange("friday")}
              value="5"
            />
          }
          label="Friday"
        />
      </FormGroup>
    );
  }
}

CheckboxLabels.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckboxLabels);
