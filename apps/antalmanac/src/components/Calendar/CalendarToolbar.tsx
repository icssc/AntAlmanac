import { IconButton, ListSubheader, Menu, Paper, Tooltip } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Delete, MoreHoriz, Undo } from '@material-ui/icons';
import React, { useEffect, useRef, useState } from 'react';

import ConditionalWrapper from '../ConditionalWrapper';
import CustomEventDialog from './Toolbar/CustomEventDialog/CustomEventDialog';
import EditSchedule from './Toolbar/EditSchedule/EditSchedule';
import ScheduleNameDialog from './Toolbar/EditSchedule/ScheduleNameDialog';
import ExportCalendar from './Toolbar/ExportCalendar';
import ScreenshotButton from './Toolbar/ScreenshotButton';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { changeCurrentSchedule, clearSchedules, undoDelete } from '$actions/AppStoreActions';
import TermViewer from '$components/Calendar/TermViewer';
import FinalsButton from '$components/Calendar/Toolbar/FinalsButton';

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
        paddingLeft: '1em',
    },
    termSelector: {
        flexGrow: 1,
        flexShrink: 1,
        display: 'flex',
        overflow: 'hidden',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        alignItems: 'center',
        maxWidth: '16rem',
        justifyContent: 'center',
        margin: '0 auto',
    },
    rootTermSelector: {
        maxWidth: '15rem',
        overflow: 'hidden',
        textAlign: 'center',
    },
    rootScheduleSelector: {
        overflow: 'hidden',
        maxWidth: '5rem',
    },
};

interface CalendarPaneToolbarProps {
    classes: ClassNameMap;
    scheduleMap: Map<string, [number, string][]>;
    currentScheduleIndex: number;
    showFinalsSchedule: boolean;
    toggleDisplayFinalsSchedule: () => void;
    onTakeScreenshot: (html2CanvasScreenshot: () => void) => void; // the function in an ancestor component that wraps ScreenshotButton.handleClick to perform canvas transformations before and after downloading the screenshot.
}

const CalendarPaneToolbar = ({
    classes,
    scheduleMap,
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

    const paperRef = useRef<HTMLDivElement>();
    const [isWideEnough, setIsWideEnough] = useState(false);

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

    useEffect(() => {
        const handleResize = () => {
            if (paperRef.current) {
                const fontSize = parseFloat(getComputedStyle(paperRef.current).fontSize);
                const widthInEm = paperRef.current.clientWidth / fontSize;
                setIsWideEnough(widthInEm > 60);
            }
        };
        handleResize();

        const resizeObserver = new ResizeObserver(handleResize);
        if (paperRef.current) {
            resizeObserver.observe(paperRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [paperRef]);

    return (
        <Paper elevation={0} variant="outlined" square className={classes.toolbar} ref={paperRef}>
            <EditSchedule />

            <div className={classes.scheduleSelector}>
                <Select
                    classes={{ root: classes.rootScheduleSelector }}
                    value={currentScheduleIndex.toString()}
                    onChange={handleScheduleChange}
                    open={openSchedules}
                    onClick={handleScheduleClick}
                >
                    {Array.from(scheduleMap.entries()).flatMap(([term, schedules]) => {
                        return [
                            <ListSubheader
                                key={term}
                                onClick={(event) => event.preventDefault()}
                                style={{ pointerEvents: 'none' }}
                            >
                                {term}
                            </ListSubheader>,
                            ...schedules.map(([scheduleIndex, scheduleName]) => (
                                <MenuItem key={scheduleIndex} value={scheduleIndex.toString()}>
                                    {scheduleName}
                                </MenuItem>
                            )),
                        ];
                    })}

                    <ScheduleNameDialog onOpen={() => setOpenSchedules(true)} onClose={() => setOpenSchedules(false)} />
                </Select>
            </div>

            <div className={classes.termSelector}>
                <TermViewer />
            </div>

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
                condition={!isWideEnough}
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
                {[
                    <ScreenshotButton onTakeScreenshot={onTakeScreenshot} key="screenshot" />,
                    <ExportCalendar key="export" />,
                    <CustomEventDialog key="custom" />,
                    <FinalsButton
                        key="finals"
                        showFinalsSchedule={showFinalsSchedule}
                        toggleDisplayFinalsSchedule={toggleDisplayFinalsSchedule}
                    />,
                ].map((element, index) => (
                    <ConditionalWrapper
                        key={index}
                        condition={!isWideEnough}
                        wrapper={(children) => <MenuItem onClick={handleMenuClose}>{children}</MenuItem>}
                    >
                        {element}
                    </ConditionalWrapper>
                ))}
            </ConditionalWrapper>
        </Paper>
    );
};

export default withStyles(styles)(CalendarPaneToolbar);
