import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { MenuItem, type SelectChangeEvent } from '@mui/material';
import { memo } from 'react';

export const OnlineField = memo(() => {
    const [building, setBuilding] = useCourseSearchParam('building');
    const [, setRoom] = useCourseSearchParam('room');

    return (
        <LabeledSelect
            label="Online Only"
            selectProps={{
                value: building === 'ON' ? 'true' : 'false',
                onChange: (event: SelectChangeEvent<string>) => {
                    const checked = event.target.value === 'true';
                    setBuilding(checked ? 'ON' : '');
                    setRoom(checked ? 'LINE' : '');
                },
                sx: { width: '100%' },
            }}
        >
            <MenuItem value="false">False</MenuItem>
            <MenuItem value="true">True</MenuItem>
        </LabeledSelect>
    );
});

OnlineField.displayName = 'OnlineField';
