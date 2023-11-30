import { Box, Card, CardActions, CardHeader, IconButton, Tooltip } from '@mui/material';
import { Delete } from '@mui/icons-material';
import moment from 'moment';
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import CustomEventDialog from '../../Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import ColorPicker from '../../ColorPicker';
import { deleteCustomEvent } from '$actions/AppStoreActions';
import analyticsEnum from '$lib/analytics';
import AppStore from '$stores/AppStore';
import { useTimeFormatStore } from '$stores/SettingsStore';
import buildingCatalogue from '$lib/buildingCatalogue';
import { useTabStore } from '$stores/TabStore';

interface CustomEventDetailViewProps {
    scheduleNames: string[];
    customEvent: RepeatingCustomEvent;
}

const CustomEventDetailView = (props: CustomEventDetailViewProps) => {
    const { customEvent } = props;
    const { isMilitaryTime } = useTimeFormatStore();

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
                title={customEvent.title}
                subheader={readableDateAndTimeFormat(customEvent.start, customEvent.end, customEvent.days)}
                style={{
                    padding: !skeletonMode ? '8px 8px 0 8px' : 8,
                }}
            />
            <Box sx={{ margin: '0.75rem', color: '#bbbbbb', fontSize: '1rem' }}>
                <Link to={`/map?location=${customEvent.building ?? 0}`} onClick={focusMap}>
                    {customEvent.building ? buildingCatalogue[+customEvent.building].name : ''}
                </Link>
            </Box>

            {!skeletonMode && (
                <CardActions disableSpacing={true} style={{ padding: 0 }}>
                    <Box
                        sx={{
                            cursor: 'pointer',
                            '& > div': {
                                margin: '0px 8px 0px 4px',
                                height: '20px',
                                width: '20px',
                                borderRadius: '50%',
                            },
                        }}
                    >
                        <ColorPicker
                            color={customEvent.color as string}
                            isCustomEvent={true}
                            customEventID={customEvent.customEventID}
                            analyticsCategory={analyticsEnum.addedClasses.title}
                        />
                    </Box>

                    <CustomEventDialog customEvent={customEvent} scheduleNames={props.scheduleNames} />

                    <Tooltip title="Delete">
                        <IconButton
                            onClick={() => {
                                deleteCustomEvent(customEvent.customEventID);
                            }}
                            size="large"
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </CardActions>
            )}
        </Card>
    );
};

export default CustomEventDetailView;
