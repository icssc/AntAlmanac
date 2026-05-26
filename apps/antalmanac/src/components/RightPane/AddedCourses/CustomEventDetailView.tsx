import { deleteCustomEvent } from '$actions/AppStoreActions';
import { MapLink } from '$components/buttons/MapLink';
import { CustomEventDialog } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import ColorPicker from '$components/ColorPicker';
import analyticsEnum from '$lib/analytics/analytics';
import buildingCatalogue from '$lib/locations/buildingCatalogue';
import { useScheduleViewSource } from '$lib/schedule/ScheduleViewContext';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { Delete } from '@mui/icons-material';
import { Card, CardActions, CardContent, CardHeader, IconButton, Skeleton, Tooltip } from '@mui/material';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { format, isValid, set } from 'date-fns';

interface CustomEventDetailViewProps {
    scheduleNames: string[];
    customEvent: RepeatingCustomEvent;
    /**
     * Wraps the rendered card in MUI's children-aware Skeleton so the card
     * sizes to its real layout while displaying as a loading placeholder.
     */
    skeleton?: boolean;
}

export function CustomEventDetailView(props: CustomEventDetailViewProps) {
    const { customEvent, skeleton = false } = props;
    const scheduleSource = useScheduleViewSource();
    const isMilitaryTime = useTimeFormatStore((store) => store.isMilitaryTime);

    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const disableActions = fallbackMode || scheduleSource.readonly;

    const readableDateAndTimeFormat = (start: string, end: string, days: boolean[]) => {
        const baseDate = new Date(2000, 0, 1);
        const startTime = set(baseDate, { hours: parseInt(start.slice(0, 2)), minutes: parseInt(start.slice(3, 5)) });
        const endTime = set(baseDate, { hours: parseInt(end.slice(0, 2)), minutes: parseInt(end.slice(3, 5)) });

        // Fall back to raw strings if the time fields can't be parsed (e.g. empty string in DB).
        if (!isValid(startTime) || !isValid(endTime)) return `${start} — ${end}`;

        const dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const daysString = days.map((includeDate, index) => (includeDate ? dayAbbreviations[index] : '')).join(' ');

        const timeFormat = isMilitaryTime ? 'HH:mm' : 'h:mm a';

        return `${format(startTime, timeFormat)} — ${format(endTime, timeFormat)} • ${daysString}`;
    };

    const card = (
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

            {!disableActions && (
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

    return skeleton ? (
        <Skeleton variant="rounded" component="div" width="100%" sx={{ pointerEvents: 'none' }}>
            {card}
        </Skeleton>
    ) : (
        card
    );
}
