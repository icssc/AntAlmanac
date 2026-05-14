import { deleteCustomEvent } from '$actions/AppStoreActions';
import { MapLink } from '$components/buttons/MapLink';
import { CustomEventDialog } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import ColorPicker from '$components/ColorPicker';
import analyticsEnum from '$lib/analytics/analytics';
import buildingCatalogue from '$lib/locations/buildingCatalogue';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { Delete } from '@mui/icons-material';
import { Card, CardActions, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { format, set } from 'date-fns';

interface CustomEventDetailViewProps {
    scheduleNames: string[];
    customEvent: RepeatingCustomEvent;
}

export function CustomEventDetailView(props: CustomEventDetailViewProps) {
    const { customEvent } = props;
    const { isMilitaryTime } = useTimeFormatStore();

    const fallbackMode = useFallbackStore((state) => state.fallbackMode);

    const readableDateAndTimeFormat = (start: string, end: string, days: boolean[]) => {
        const startHours = parseInt(start.slice(0, 2));
        const startMinutes = parseInt(start.slice(3, 5));
        const endHours = parseInt(end.slice(0, 2));
        const endMinutes = parseInt(end.slice(3, 5));

        // Guard against malformed time strings (e.g. from third-party imports).
        // Passing NaN to date-fns set() produces an Invalid Date, and the subsequent
        // format() call would throw RangeError: Invalid time value at Date.toISOString.
        if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
            return `${start} — ${end}`;
        }

        const baseDate = new Date(2000, 0, 1);
        const startTime = set(baseDate, { hours: startHours, minutes: startMinutes });
        const endTime = set(baseDate, { hours: endHours, minutes: endMinutes });

        const dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const daysString = days.map((includeDate, index) => (includeDate ? dayAbbreviations[index] : '')).join(' ');

        const timeFormat = isMilitaryTime ? 'HH:mm' : 'h:mm a';

        return `${format(startTime, timeFormat)} — ${format(endTime, timeFormat)} • ${daysString}`;
    };

    return (
        <Card>
            <CardHeader
                title={customEvent.title}
                slotProps={{
                    title: {
                        variant: 'subtitle1',
                    },
                }}
                subheader={readableDateAndTimeFormat(customEvent.start, customEvent.end, customEvent.days)}
                sx={{ padding: 1 }}
            />

            <CardContent sx={{ paddingX: 1, paddingY: 0 }}>
                <MapLink
                    buildingId={Number(customEvent.building) || 0}
                    room={(customEvent.building && buildingCatalogue[+customEvent.building]?.name) || ''}
                />
            </CardContent>

            {!fallbackMode && (
                <CardActions disableSpacing={true}>
                    <ColorPicker
                        color={customEvent.color ?? '#551a8b'}
                        isCustomEvent={true}
                        customEventID={customEvent.customEventID}
                        analyticsCategory={analyticsEnum.addedClasses}
                    />

                    <CustomEventDialog customEvent={customEvent} scheduleNames={props.scheduleNames} />

                    <Tooltip title="Delete">
                        <IconButton
                            sx={{ padding: 0.5 }}
                            onClick={() => {
                                deleteCustomEvent(customEvent.customEventID, [AppStore.getCurrentScheduleIndex()]);
                            }}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </CardActions>
            )}
        </Card>
    );
}
