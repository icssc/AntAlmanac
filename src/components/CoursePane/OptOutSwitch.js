import React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Switch, Typography } from '@material-ui/core';

const styles = (theme) => ({
  typography: {
    margin: theme.spacing.unit * 2,
  },
});

class OptOutSwitch extends React.Component {
  constructor(props) {
    super(props);
    //this.action = this.props.action.bind(this);
    this.optingOut = props.optOut;

    //  this.state = {
    //    optingOut: props.optOut,
    //   };
  }

  //  handleChange = name => event => {
  //   this.setState({ [name]: event.target.checked });
  // };

  render() {
    return (
      <Typography>
        <FormControlLabel
          control={
            <Switch
              checked={this.optingOut}
              onChange={this.action}
              value="optingOut"
              color="primary"
              style={{ margin: 0 }}
            />
          }
          label="OPT OUT OF EATEREVALS"
        />
      </Typography>
    );
  }
}

export default OptOutSwitch;
