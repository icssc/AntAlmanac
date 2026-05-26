import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams';

export function RoomField() {
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
}
