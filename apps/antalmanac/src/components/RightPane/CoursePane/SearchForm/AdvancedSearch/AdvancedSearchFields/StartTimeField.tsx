import { LabeledTimePicker } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTimePicker';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { format, isValid, parse } from 'date-fns';

export function StartTimeField() {
    const [startTime, setStartTime] = useCourseSearchParam('startTime');

    return (
        <LabeledTimePicker
            label="Starts After"
            timePickerProps={{
                value: startTime ? parse(startTime, 'HH:mm', new Date()) : null,
                onChange: (event) => {
                    if (event instanceof Date || event === null) {
                        const stringTime = event && isValid(event) ? format(event, 'HH:mm') : '';
                        setStartTime(stringTime);
                    }
                },
                timeSteps: { minutes: 10 },
            }}
            textFieldProps={{ fullWidth: true, sx: { minWidth: 120 } }}
        />
    );
}
