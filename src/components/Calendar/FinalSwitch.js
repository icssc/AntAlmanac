import React from 'react';
import { Switch, Typography } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';

class FinalSwitch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showFinal: true,
    };
  }
  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.checked });
    this.props.displayFinal(this.props.schedule);
  };

  render() {
    return (
      <Typography>
        <FormControlLabel
          control={
            <Switch
              checked={this.props.showFinalSchedule}
              onChange={this.handleChange('showFinal')}
              value="showFinal"
              color="primary"
              style={{ margin: 0 }}
            />
          }
          label="FINALS"
        />
      </Typography>
    );
  }
}

export default FinalSwitch;
