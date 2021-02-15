import React, { Fragment } from 'react';
import { Menu, MenuItem, MenuList, Button, Typography } from '@material-ui/core';
import { GetApp } from '@material-ui/icons';
import ScreenshotButton from './ScreenshotButton';
import ExportButton from './ExportCalendar';
import Tooltip from '@material-ui/core/Tooltip';

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
                    <Button
                        onClick={this.handleClick}
                        style={{ marginRight: 5, marginLeft: 5 }}
                        variant="outlined"
                        size="small"
                    >
                        <GetApp fontSize="small" />
                        Export
                    </Button>
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
                            <MenuItem component={ScreenshotButton} onTakeScreenshot={this.props.onTakeScreenshot} />
                        </div>
                        <div>
                            <MenuItem component={ExportButton} eventsInCalendar={this.props.eventsInCalendar} />
                        </div>
                    </MenuList>
                </Menu>
            </Fragment>
        );
    }
}

export default DownloadMenu;
