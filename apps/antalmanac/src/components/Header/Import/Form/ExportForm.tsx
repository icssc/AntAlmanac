import { DialogContentText } from '@mui/material';
import { type ShortCourseSchedule } from '@packages/antalmanac-types';

import { ScheduleList } from './ScheduleList';

interface ExportFormProps {
    schedules: ShortCourseSchedule[];
    selectedIndices: Set<number>;
    onSelectedIndicesChange: (indices: Set<number>) => void;
}

export function ExportForm({ schedules, selectedIndices, onSelectedIndicesChange }: ExportFormProps) {
    return (
        <>
            <DialogContentText sx={{ mb: 2 }}>
                Select which schedules you want to export. The exported file will be in JSON format and can be imported
                back into AntAlmanac.
            </DialogContentText>
            {schedules.length > 0 && (
                <ScheduleList
                    schedules={schedules}
                    selectedIndices={selectedIndices}
                    onSelectedIndicesChange={onSelectedIndicesChange}
                />
            )}
        </>
    );
}
