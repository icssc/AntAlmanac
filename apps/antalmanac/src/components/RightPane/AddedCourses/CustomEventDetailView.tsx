import { Card, CardActions, CardHeader, IconButton } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { Delete } from '@material-ui/icons';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useCallback } from 'react';

import CustomEventDialog, { RepeatingCustomEvent } from '../../Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import ColorPicker from '../../ColorPicker';
import { deleteCustomEvent } from '$actions/AppStoreActions';
import analyticsEnum from '$lib/analytics';
import { useTimeFormatStore } from '$stores/SettingsStore';
import buildingCatalogue from '$lib/buildingCatalogue';
import { useTabStore } from '$stores/TabStore';

const styles = {
    root: {
        padding: '4px 4px 0px 8px',
    },
    customEventLocation: {
        margin: '0.75rem',
        color: '#bbbbbb',
        fontSize: '1rem',
    },
    colorPicker: {
        cursor: 'pointer',
        '& > div': {
            margin: '0px 8px 0px 4px',
            height: '20px',
            width: '20px',
            borderRadius: '50%',
        },
    },
};

interface CustomEventDetailViewProps {
    classes: ClassNameMap;
    customEvent: RepeatingCustomEvent;
    currentScheduleIndex: number;
    scheduleNames: string[];
}

const CustomEventDetailView = (props: CustomEventDetailViewProps) => {
    const { classes, customEvent } = props;
    const { isMilitaryTime } = useTimeFormatStore();

    const readableDateAndTimeFormat = (start: string, end: string, days: boolean[]) => {
        const startTime = moment({
            hours: parseInt(start.slice(0, 2)),
            minutes: parseInt(start.slice(3, 5)),
        });

        const endTime = moment({
            hours: parseInt(end.slice(0, 2)),
            minutes: parseInt(end.slice(3, 5)),
        });

        const dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const daysString = days.map((includeDate, index) => (includeDate ? dayAbbreviations[index] : '')).join(' ');

        const timeFormat = isMilitaryTime ? 'HH:mm' : 'h:mm A';

        return `${startTime.format(timeFormat)} — ${endTime.format(timeFormat)} • ${daysString}`;
    };

    const { setActiveTab } = useTabStore();

    const focusMap = useCallback(() => {
        setActiveTab(2);
    }, [setActiveTab]);

    return (
        <Card>
            <CardHeader
                titleTypographyProps={{ variant: 'subtitle1' }}
                className={classes.root}
                title={customEvent.title}
                subheader={readableDateAndTimeFormat(customEvent.start, customEvent.end, customEvent.days)}
            />
            <div className={classes.customEventLocation}>
                <Link
                    className={classes.clickableLocation}
                    to={`/map?location=${customEvent.building ?? 0}`}
                    onClick={focusMap}
                >
                    {customEvent.building ? buildingCatalogue[+customEvent.building].name : ''}
                </Link>
            </div>
            <CardActions disableSpacing={true}>
                <div className={classes.colorPicker}>
                    <ColorPicker
                        color={customEvent.color as string}
                        isCustomEvent={true}
                        customEventID={customEvent.customEventID}
                        analyticsCategory={analyticsEnum.addedClasses.title}
                    />
                </div>
                <CustomEventDialog customEvent={customEvent} scheduleNames={props.scheduleNames} />
                <IconButton
                    onClick={() => {
                        deleteCustomEvent(customEvent.customEventID);
                    }}
                >
                    <Delete fontSize="small" />
                </IconButton>
            </CardActions>
        </Card>
    );
};

export default withStyles(styles)(CustomEventDetailView);
