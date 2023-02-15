import { Button, IconButton, Menu,Paper, Tooltip, useMediaQuery } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Delete, MoreHoriz,Undo } from '@material-ui/icons';
import React, { useState } from 'react';

import { changeCurrentSchedule, clearSchedules, undoDelete } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import ConditionalWrapper from '../ConditionalWrapper';
import CustomEventDialog from './Toolbar/CustomEventDialog/CustomEventDialog';
import EditSchedule from './Toolbar/EditSchedule/EditSchedule';
import ScheduleNameDialog from './Toolbar/EditSchedule/ScheduleNameDialog';
import ExportCalendar from './Toolbar/ExportCalendar';
import ScreenshotButton from './Toolbar/ScreenshotButton';

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

    const handleScheduleClick = () => {
        setOpenSchedules((prev) => !prev);
    };

    return (
        <Paper elevation={0} variant="outlined" square className={classes.toolbar}>
            <EditSchedule scheduleNames={scheduleNames} scheduleIndex={currentScheduleIndex} />

            <Select
                classes={{ root: classes.rootScheduleSelector }}
                className={classes.scheduleSelector}
                value={currentScheduleIndex}
                onChange={handleScheduleChange}
                open={openSchedules}
                onClick={handleScheduleClick}
            >
                {scheduleNames.map((name, index) => (
                    <MenuItem key={index} value={index}>
                        {name}
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

            <Tooltip title="Undo last deleted course">
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
                        if (
                            window.confirm(
                                'Are you sure you want to clear this schedule? You cannot undo this action, but you can load your schedule again.'
                            )
                        ) {
                            clearSchedules([currentScheduleIndex]);
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
                        <ExportCalendar key="export"/>,
                        <ScreenshotButton onTakeScreenshot={onTakeScreenshot} key="screenshot"/>,
                        <CustomEventDialog
                            currentScheduleIndex={currentScheduleIndex}
                            scheduleNames={scheduleNames}
                            key="custom"
                        />,
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
