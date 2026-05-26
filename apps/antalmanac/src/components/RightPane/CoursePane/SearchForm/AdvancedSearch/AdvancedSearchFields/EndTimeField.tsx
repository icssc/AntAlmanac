import { LabeledTimePicker } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTimePicker';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { format, isValid, parse } from 'date-fns';
import { memo } from 'react';

export const EndTimeField = memo(() => {
    const [endTime, setEndTime] = useCourseSearchParam('endTime');

    return (
        <LabeledTimePicker
            label="Ends Before"
            timePickerProps={{
                value: endTime ? parse(endTime, 'HH:mm', new Date()) : null,
                onChange: (event) => {
                    if (event instanceof Date || event === null) {
                        const stringTime = event && isValid(event) ? format(event, 'HH:mm') : '';
                        setEndTime(stringTime);
                    }
                },
                timeSteps: { minutes: 10 },
            }}
            textFieldProps={{ fullWidth: true, sx: { minWidth: 120 } }}
        />
    );
});

EndTimeField.displayName = 'EndTimeField';
