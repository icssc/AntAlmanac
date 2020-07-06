import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardActions, CardHeader, IconButton } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import ColorPicker from '../App/ColorPicker';
import moment from 'moment';
import { deleteCustomEvent } from '../../actions/AppStoreActions';
import CustomEventDialog from '../CustomEvents/CustomEventDialog';

const styles = {
    root: {
        padding: '4px 4px 0px 8px',
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

const CustomEventDetailView = (props) => {
    const { classes, customEvent } = props;

    const readableDateAndTimeFormat = (start, end, days) => {
        const startTime = moment({
            hours: start.slice(0, 2),
            minutes: start.slice(3, 5),
        });

        const endTime = moment({
            hours: end.slice(0, 2),
            minutes: end.slice(3, 5),
        });

        const daysString = days.reduce(
            (accumulator, currentValue, index, array) => {
                switch (index) {
                    case 0:
                        return array[0]
                            ? accumulator + 'Mon '
                            : accumulator + '';
                    case 1:
                        return array[1]
                            ? accumulator + 'Tue '
                            : accumulator + '';
                    case 2:
                        return array[2]
                            ? accumulator + 'Wed '
                            : accumulator + '';
                    case 3:
                        return array[3]
                            ? accumulator + 'Thu '
                            : accumulator + '';
                    case 4:
                        return array[4]
                            ? accumulator + 'Fri '
                            : accumulator + '';
                }
            },
            ''
        );

        return `${startTime.format('h:mm A')} — ${endTime.format(
            'h:mm A'
        )} • ${daysString}`;
    };

    return (
        <Card>
            <CardHeader
                titleTypographyProps={{ variant: 'subtitle1' }}
                className={classes.root}
                title={customEvent.title}
                subheader={readableDateAndTimeFormat(
                    customEvent.start,
                    customEvent.end,
                    customEvent.days
                )}
            />
            <CardActions disableSpacing={true}>
                <div className={classes.colorPicker}>
                    <ColorPicker
                        color={customEvent.color}
                        isCustomEvent={true}
                        customEventID={customEvent.customEventID}
                    />
                </div>
                <IconButton
                    onClick={() =>
                        deleteCustomEvent(
                            customEvent.customEventID,
                            props.currentScheduleIndex
                        )
                    }
                >
                    <Delete fontSize="small" />
                </IconButton>
                <CustomEventDialog customEvent={customEvent} />
            </CardActions>
        </Card>
    );
};

export default withStyles(styles)(CustomEventDetailView);
