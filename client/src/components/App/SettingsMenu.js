import React, { PureComponent, Fragment } from 'react';
import {
  Popover,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  FormLabel,
  Badge,
  Switch,
} from '@material-ui/core';
import { Settings } from '@material-ui/icons';
import AppStore from '../../stores/AppStore';
import { toggleDarkMode, toggleEvals } from '../../actions/AppStoreActions';
import { isMobile } from 'react-device-detect';


//Material UI Popover at top toolbar, allows users to select whether
//staff names link out to RateMyProfessors.com or UCI's EaterEvals.
// Also darkmode.

class SettingsMenu extends PureComponent {
  state = {
      anchorEl: null,
      darkMode: AppStore.getDarkMode(),
      evalDestination: AppStore.getEvalDestination(),
  };

  componentDidMount = () => {
      AppStore.on('darkModeToggle', () => {
        this.setState({darkMode: AppStore.getDarkMode()});
      });

      AppStore.on('evalsToggle', () => {
        this.setState({evalDestination: AppStore.getEvalDestination()});
      });
  };

  render() {
    return(
      <Fragment>
        <Button
          onClick={(event) => {
            this.setState({anchorEl: event.currentTarget});
          }}
          color="inherit"
        >
          <Badge color="secondary" variant="dot" style={{marginRight: 4}}>
            <Settings />
          </Badge>
          {!isMobile ? (
              'Settings'
          ) : (
              <Fragment />
          )}
        </Button>
        <Popover
          id="render-props-popover"
          open={Boolean(this.state.anchorEl)}
          anchorEl={this.state.anchorEl}
          onClose={() => {
            this.setState({anchorEl: null});
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <FormControl
            style={{ margin: 16 }}
            component="fieldset"
          >
            <FormLabel component="legend" style={{ marginTop: 16 }}>
              Instructor Evaluations
            </FormLabel>
            <RadioGroup
              aria-label="InstructorEvals"
              name="evaluations"
              style={{ margin: 5 }}
              value={this.state.evalDestination}
              onChange={toggleEvals}
            >
              <FormControlLabel
                value="rmp"
                control={<Radio color="primary"/>}
                label="View on RateMyProfessor"
              />
              <FormControlLabel
                value="eatereval"
                control={<Radio color="primary"/>}
                label="View on EaterEvals"
              />
            </RadioGroup>

            <FormControlLabel
              control={
                <Switch
                  checked={this.state.darkMode}
                  onChange={toggleDarkMode}
                  value="darkMode"
                  color="primary"
                />
              }
              label={
                <Badge badgeContent={'BETA'} color="error">
                  <Typography>Dark Mode &nbsp; &nbsp; &nbsp;</Typography>
                </Badge>
              }
            />
          </FormControl>
        </Popover>
      </Fragment>
    );
  }
}

export default SettingsMenu;
