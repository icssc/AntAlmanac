import { Box, Button, IconButton, Menu, Paper, Tooltip, useMediaQuery } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Delete, Edit, MoreHoriz, Undo } from '@material-ui/icons';
import React, { useState } from 'react';

import ConditionalWrapper from '../ConditionalWrapper';
import CustomEventDialog from './Toolbar/CustomEventDialog/CustomEventDialog';
import EditSchedule from './Toolbar/EditSchedule/EditSchedule';
import ScheduleNameDialog from './Toolbar/EditSchedule/ScheduleNameDialog';
import DeleteScheduleDialog from './Toolbar/EditSchedule/DeleteScheduleDialog';
import ExportCalendar from './Toolbar/ExportCalendar';
import ScreenshotButton from './Toolbar/ScreenshotButton';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { changeCurrentSchedule, clearSchedules, undoDelete } from '$actions/AppStoreActions';

const styles: Styles<Theme, object> = {
    toolbar: {
        display: 'flex',
        overflow: 'hidden',
        marginBottom: '4px',
        alignItems: 'center',
        height: '50px',

        '& button': {
            margin: '0 2px 0 2px',
        },
        '& #finalButton': {
            marginLeft: '12px',
        },
        padding: '2px',
    },
    inline: {
        display: 'inline',
    },
    spacer: {
        flexGrow: 1,
    },
    scheduleSelector: {
        marginLeft: '10px',
        maxWidth: '9rem',
    },
    rootScheduleSelector: {
        paddingLeft: '5px',
    },
    menuItem: {
        gap: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
    },
    dialogContainer: {
        display: 'flex',
        gap: '0.25rem',
    },
};

interface CalendarPaneToolbarProps {
    classes: ClassNameMap;
    scheduleNames: string[];
    currentScheduleIndex: number;
    showFinalsSchedule: boolean;
    toggleDisplayFinalsSchedule: () => void;
    onTakeScreenshot: (html2CanvasScreenshot: () => void) => void; // the function in an ancestor component that wraps ScreenshotButton.handleClick to perform canvas transformations before and after downloading the screenshot.
}

const CalendarPaneToolbar = ({
    classes,
    scheduleNames,
    currentScheduleIndex,
    showFinalsSchedule,
    toggleDisplayFinalsSchedule,
    onTakeScreenshot,
}: CalendarPaneToolbarProps) => {
    const handleScheduleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        logAnalytics({
            category: analyticsEnum.calendar.title,
            action: analyticsEnum.calendar.actions.CHANGE_SCHEDULE,
        });
        changeCurrentSchedule(event.target.value as number);
    };

    const isMobileScreen = useMediaQuery('(max-width:630px)');

    const [anchorEl, setAnchorEl] = useState<HTMLElement>();
    const [openSchedules, setOpenSchedules] = useState<boolean>(false);

    const handleMenuClick: React.MouseEventHandler<HTMLElement> = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose: React.MouseEventHandler<HTMLElement> = () => {
        setAnchorEl(undefined);
    };

    const handleScheduleOpen = () => {
        setOpenSchedules(true);
    };

    const handleScheduleClose = () => {
        setOpenSchedules(false);
    };

    const handleDialogButtonClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation(); // Propagation must be stopped otherwise the closing schedule Select element will also close the Dialogs
    };

    const handleDialogClose = () => {
        setAnchorEl(undefined);
        setOpenSchedules(false);
    };

    return (
        <Paper elevation={0} variant="outlined" square className={classes.toolbar}>
            <EditSchedule scheduleNames={scheduleNames} scheduleIndex={currentScheduleIndex} />

            <Select
                classes={{ root: classes.rootScheduleSelector }}
                className={classes.scheduleSelector}
                value={currentScheduleIndex}
                onChange={(e) => handleScheduleChange(e)}
                renderValue={(currentScheduleIndex) => scheduleNames[currentScheduleIndex as number]} // Typecasting is done here to keep ts happy
                open={openSchedules}
                onOpen={handleScheduleOpen}
                onClose={handleScheduleClose}
            >
                {scheduleNames.map((name, index) => (
                    <MenuItem key={index} value={index} className={classes.menuItem}>
                        {name}

                        <Box className={classes.dialogContainer}>
                            <Box onClick={(e) => handleDialogButtonClick(e)}>
                                <ScheduleNameDialog
                                    scheduleNames={scheduleNames}
                                    scheduleRenameIndex={index}
                                    onClose={handleDialogClose}
                                />
                            </Box>
                            <Box onClick={(e) => handleDialogButtonClick(e)}>
                                <DeleteScheduleDialog onClose={handleDialogClose} scheduleIndex={index} />
                            </Box>
                        </Box>
                    </MenuItem>
                ))}
                <ScheduleNameDialog
                    onOpen={() => setOpenSchedules(true)}
                    onClose={() => setOpenSchedules(false)}
                    scheduleNames={scheduleNames}
                />
            </Select>

            <Tooltip title="Toggle showing finals schedule">
                <Button
                    id="finalButton"
                    variant={showFinalsSchedule ? 'contained' : 'outlined'}
                    onClick={() => {
                        logAnalytics({
                            category: analyticsEnum.calendar.title,
                            action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
                        });
                        toggleDisplayFinalsSchedule();
                    }}
                    size="small"
                    color={showFinalsSchedule ? 'primary' : 'default'}
                >
                    Finals
                </Button>
            </Tooltip>

            <div className={classes.spacer} />

            <Tooltip title="Undo last action">
                <IconButton
                    onClick={() => {
                        logAnalytics({
                            category: analyticsEnum.calendar.title,
                            action: analyticsEnum.calendar.actions.UNDO,
                        });
                        undoDelete(null);
                    }}
                >
                    <Undo fontSize="small" />
                </IconButton>
            </Tooltip>

            <Tooltip title="Clear schedule">
                <IconButton
                    onClick={() => {
                        if (window.confirm('Are you sure you want to clear this schedule?')) {
                            clearSchedules();
                            logAnalytics({
                                category: analyticsEnum.calendar.title,
                                action: analyticsEnum.calendar.actions.CLEAR_SCHEDULE,
                            });
                        }
                    }}
                >
                    <Delete fontSize="small" />
                </IconButton>
            </Tooltip>

            <ConditionalWrapper
                condition={isMobileScreen}
                wrapper={(children) => (
                    <div>
                        <IconButton onClick={handleMenuClick}>
                            <MoreHoriz />
                        </IconButton>

                        <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            {children}
                        </Menu>
                    </div>
                )}
            >
                <>
                    {[
                        <ExportCalendar key="export" />,
                        <ScreenshotButton onTakeScreenshot={onTakeScreenshot} key="screenshot" />,
                        <CustomEventDialog scheduleNames={scheduleNames} key="custom" />,
                    ].map((element, index) => (
                        <ConditionalWrapper
                            key={index}
                            condition={isMobileScreen}
                            wrapper={(children) => <MenuItem onClick={handleMenuClose}>{children}</MenuItem>}
                        >
                            {element}
                        </ConditionalWrapper>
                    ))}
                </>
            </ConditionalWrapper>
        </Paper>
    );
};

export default withStyles(styles)(CalendarPaneToolbar);
