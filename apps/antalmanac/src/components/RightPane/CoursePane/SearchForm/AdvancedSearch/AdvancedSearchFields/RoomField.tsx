import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { memo } from 'react';

export const RoomField = memo(() => {
    const [room, setRoom] = useCourseSearchParam('room');

    return (
        <LabeledTextField
            label="Room"
            textFieldProps={{
                id: 'room',
                type: 'search',
                value: room,
                onChange: (event) => setRoom(event.target.value),
                fullWidth: true,
            }}
        />
    );
});

RoomField.displayName = 'RoomField';
