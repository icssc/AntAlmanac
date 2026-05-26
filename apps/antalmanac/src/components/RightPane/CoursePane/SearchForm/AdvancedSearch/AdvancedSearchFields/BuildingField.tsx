import { LabeledTextField } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams';

export function BuildingField() {
    const [building, setBuilding] = useCourseSearchParam('building');

    return (
        <LabeledTextField
            label="Building"
            textFieldProps={{
                id: 'building',
                type: 'search',
                value: building,
                onChange: (event) => setBuilding(event.target.value),
                fullWidth: true,
            }}
        />
    );
}
