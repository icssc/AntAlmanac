import { Card, CardActions, CardHeader, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import moment from 'moment';
import { useEffect, useState } from 'react';

import CustomEventDialog, { RepeatingCustomEvent } from '../../Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import ColorPicker from '../../ColorPicker';
import { deleteCustomEvent } from '$actions/AppStoreActions';
import analyticsEnum from '$lib/analytics';
import AppStore from '$stores/AppStore';

interface CustomEventDetailViewProps {
    customEvent: RepeatingCustomEvent;
}

const CustomEventDetailView = (props: CustomEventDetailViewProps) => {
    const { customEvent } = props;

    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

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

        return `${startTime.format('h:mm A')} — ${endTime.format('h:mm A')} • ${daysString}`;
    };

    return (
        <Card>
            <CardHeader
                titleTypographyProps={{ variant: 'subtitle1' }}
                title={customEvent.title}
                subheader={readableDateAndTimeFormat(customEvent.start, customEvent.end, customEvent.days)}
                style={{
                    padding: !skeletonMode ? '8px 8px 0 8px' : 8,
                }}
            />
            {!skeletonMode && (
                <CardActions disableSpacing={true} style={{ padding: 0 }}>
                    <ColorPicker
                        color={customEvent.color as string}
                        isCustomEvent={true}
                        customEventID={customEvent.customEventID}
                        analyticsCategory={analyticsEnum.addedClasses.title}
                    />
                    <CustomEventDialog customEvent={customEvent} />
                    <IconButton
                        onClick={() => {
                            deleteCustomEvent(customEvent.customEventID);
                        }}
                        size="large"
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </CardActions>
            )}
        </Card>
    );
};

export default CustomEventDetailView;
