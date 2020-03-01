import React, { Fragment } from 'react';
import { Switch } from '@material-ui/core';
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
      <Fragment>
        <FormControlLabel
          control={
            <Switch
              checked={this.props.showFinalSchedule}
              onChange={this.handleChange('showFinal')}
              value="showFinal"
              color="primary"
              size="small"
            />
          }
          label={this.props.isDesktop ? 'FINALS' : 'Fn'}
        />
      </Fragment>
    );
  }
}

export default FinalSwitch;
