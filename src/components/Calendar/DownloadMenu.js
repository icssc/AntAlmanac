import React, { Fragment, Suspense } from 'react';
import {
  Menu,
  MenuItem,
  MenuList,
  IconButton,
  Typography,
  Tooltip,
} from '@material-ui/core';
import { GetApp } from '@material-ui/icons';

const ScreenshotButton = React.lazy(() => import('./ScreenshotButton'));
const ExportButton = React.lazy(() => import('./ExportCalendar'));

class DownloadMenu extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;

    return (
      <Fragment>
        <Tooltip title="Download">
          <IconButton onClick={this.handleClick}>
            <GetApp fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          id="downloadMenu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuList>
            <div>
              <Suspense
                fallback={
                  <Typography variant="h5" style={{ margin: 10 }}>
                    Holup...
                  </Typography>
                }
              >
                <MenuItem
                  component={ScreenshotButton}
                  onTakeScreenshot={this.props.onTakeScreenshot}
                  closeMenu={this.handleClose}
                />
              </Suspense>
            </div>
            <div>
              <Suspense
                fallback={
                  <Typography variant="h5" style={{ margin: 10 }}>
                    Holup...
                  </Typography>
                }
              >
                <MenuItem
                  component={ExportButton}
                  eventsInCalendar={this.props.eventsInCalendar}
                  closeMenu={this.handleClose}
                />
              </Suspense>
            </div>
          </MenuList>
        </Menu>
      </Fragment>
    );
  }
}

export default DownloadMenu;
