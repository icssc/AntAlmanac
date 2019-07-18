import React, { Fragment } from 'react';
import {
    Menu,
    MenuItem,
    MenuList,
    IconButton,
    Switch,
    Typography,
    FormControlLabel,
} from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import CustomEventsDialog from '../CustomEvents/CustomEventDialog';
import ClearSchedButton from './ClearScheduleDialog';
import {
    usePopupState,
    bindHover,
    bindTrigger,
    bindPopover,
    bindMenu,
} from 'material-ui-popup-state/hooks';

const Submenu = (props) => {
    const popupState = usePopupState({ variant: 'popover' });

    return (
        <Fragment>
            <IconButton {...bindTrigger(popupState)}>
                <MoreVert fontSize="small" />
            </IconButton>
            <Menu
                {...bindMenu(popupState)}
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
                    <MenuItem disableGutters>
                        <CustomEventsDialog
                            editMode={false}
                            handleSubmenuClose={() => popupState.close()}
                        />
                    </MenuItem>
                    <MenuItem>
                        <Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={props.showFinalsSchedule}
                                        onChange={
                                            props.toggleDisplayFinalsSchedule
                                        }
                                        color="primary"
                                    />
                                }
                                label="Show finals"
                            />
                        </Typography>
                    </MenuItem>
                    <MenuItem disableGutters>
                        <ClearSchedButton
                            handleSubmenuClose={() => popupState.close()}
                            currentScheduleIndex={props.currentScheduleIndex}
                        />
                    </MenuItem>
                </MenuList>
            </Menu>
        </Fragment>
    );
};

export default Submenu;
