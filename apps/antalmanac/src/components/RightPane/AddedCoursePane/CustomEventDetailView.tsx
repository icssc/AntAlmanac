import { Delete } from '@mui/icons-material';
import { Box, Card, CardActions, CardHeader, IconButton, Tooltip } from '@mui/material';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import moment from 'moment';

import { deleteCustomEvent } from '$actions/AppStoreActions';
import { CustomEventDialog } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { ColorPicker } from '$components/ColorPicker';
import { MapLink } from '$components/buttons/MapLink';
import analyticsEnum from '$lib/analytics/analytics';
import buildingCatalogue from '$lib/locations/buildingCatalogue';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { useTimeFormatStore } from '$stores/SettingsStore';

interface CustomEventDetailViewProps {
    scheduleNames: string[];
    customEvent: RepeatingCustomEvent;
}

const CustomEventDetailView = (props: CustomEventDetailViewProps) => {
    const { customEvent } = props;
    const { isMilitaryTime } = useTimeFormatStore();
    const { fallback } = useFallbackStore();

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

    return (
        <Card>
            <CardHeader
                titleTypographyProps={{ variant: 'subtitle1' }}
                title={customEvent.title}
                subheader={readableDateAndTimeFormat(customEvent.start, customEvent.end, customEvent.days)}
                sx={{ padding: !fallback ? '8px 8px 0 8px' : 8 }}
            />
            <Box sx={{ margin: '0.75rem', color: '#bbbbbb', fontSize: '1rem' }}>
                <MapLink
                    buildingId={Number(customEvent.building) || 0}
                    room={(customEvent.building && buildingCatalogue[+customEvent.building]?.name) || ''}
                />
            </Box>

            {!fallback && (
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
                            analyticsCategory={analyticsEnum.addedClasses}
                        />
                    </Box>

                    <CustomEventDialog customEvent={customEvent} scheduleNames={props.scheduleNames} />

                    <Tooltip title="Delete">
                        <IconButton
                            onClick={() => {
                                deleteCustomEvent(customEvent.customEventID, [AppStore.getCurrentScheduleIndex()]);
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
